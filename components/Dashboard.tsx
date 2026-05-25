'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Boxes, CalendarDays, CircuitBoard, ExternalLink, RadioTower, Zap, Layers } from 'lucide-react';
import { DASHBOARD_ANALYTICS, DASHBOARD_KPIS, EMBEDDED_SHEET_DATA, TAB_NAMES, SHEET_ID } from '@/lib/sheet-data';
import { SyncButton } from '@/components/SyncButton';

const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

const ACCENT_COLORS = ['#38f4ff', '#8b5cf6', '#b8ff63', '#ff4fd8'];

/* ── Animated counter ── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}</>;
}

/* ── Animated bar ── */
function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${width}%`, background: color, transition: 'width 1.1s cubic-bezier(.22,1,.36,1)' }} />
    </div>
  );
}

/* ── Donut chart ── */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cursor = 0;
  const R = 70; const CX = 90; const CY = 90; const STROKE = 18;

  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const start = cursor;
    cursor += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cursor * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { ...seg, path: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`, pct };
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" className="donut-svg">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={STROKE} />
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={STROKE} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${a.color}88)` }} />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fill="#fff" fontSize="22" fontFamily="Andral,monospace" fontWeight="bold">{total}</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill="#91a4bf" fontSize="9" letterSpacing="2">ITEMS</text>
      </svg>
      <div className="donut-legend">
        {arcs.map((a, i) => (
          <div key={i} className="legend-row">
            <span className="legend-dot" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
            <span className="legend-label">{a.label}</span>
            <span className="legend-val">{Math.round(a.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pulse ring decoration ── */
function PulseRing() {
  return (
    <div className="pulse-ring-wrap" aria-hidden>
      <div className="pulse-ring r1" />
      <div className="pulse-ring r2" />
      <div className="pulse-ring r3" />
      <div className="pulse-center" />
    </div>
  );
}

export function Dashboard() {
  const maxItems = Math.max(...DASHBOARD_ANALYTICS.departmentItems.map((d) => d.items));

  return (
    <main className="main">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">SYSTEMS PRECISION ENGINEERING · ELECTRIC CASTLE 2026</div>
          <h1><span className="gradient-text">Mainstage command dashboard.</span></h1>
          <p>A Nodal Technical Consultancy interface built from the live workbook — all pages, executive KPIs, analytics, and schedule telemetry.</p>
          <div className="hero-actions">
            <Link className="btn" href="/sheet/OVERVIEW"><CircuitBoard size={17} /> Open Workbook</Link>
            <a className="btn secondary" href={SHEETS_URL} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Google Sheet</a>
            <a className="btn secondary" href="https://nodaltc.com" target="_blank" rel="noreferrer"><RadioTower size={17} /> Nodal Website</a>
            <SyncButton />
          </div>
        </div>
        <PulseRing />
      </section>

      {/* ── KPIs ── */}
      <section className="section">
        <div className="kpi-grid">
          {[
            { label: 'Workbook Pages', value: DASHBOARD_KPIS.tabs, note: 'All sheet tabs mirrored', color: '#38f4ff' },
            { label: 'Departments', value: DASHBOARD_KPIS.departments, note: 'Audio, lighting, video, power…', color: '#8b5cf6' },
            { label: 'Line Items', value: DASHBOARD_KPIS.trackedItems, note: 'Parsed from advancing rows', color: '#b8ff63' },
            { label: 'Schedule Days', value: DASHBOARD_KPIS.scheduleDays, note: 'Build → show → strike', color: '#ff4fd8' },
          ].map((k, idx) => (
            <div key={idx} className="kpi-card" style={{ '--glow': k.color } as React.CSSProperties}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value"><Counter to={k.value} /></div>
              <div className="kpi-note">{k.note}</div>
              <div className="kpi-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CHARTS ROW ── */}
      <section className="section dashboard-grid">
        {/* Workload bars */}
        <div className="glass-card panel">
          <div className="section-head">
            <div>
              <div className="eyebrow">WORKLOAD ANALYTICS</div>
              <h2 className="section-title">Department density</h2>
              <p className="section-copy">Relative technical requirement density by department, extracted from advancing rows.</p>
            </div>
            <Activity color="#38f4ff" size={22} />
          </div>
          <div className="chart-bars">
            {DASHBOARD_ANALYTICS.departmentItems.map((d, i) => (
              <div className="bar-row" key={d.dept}>
                <span>{d.dept}</span>
                <AnimatedBar
                  pct={Math.max(6, (d.items / maxItems) * 100)}
                  color={`linear-gradient(90deg, ${ACCENT_COLORS[i % 4]}, ${ACCENT_COLORS[(i + 1) % 4]})`}
                />
                <span>{d.items}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="glass-card panel">
          <div className="section-head">
            <div>
              <div className="eyebrow">DISTRIBUTION</div>
              <h2 className="section-title">Item split</h2>
            </div>
            <Boxes color="#b8ff63" size={22} />
          </div>
          <DonutChart
            segments={DASHBOARD_ANALYTICS.departmentItems.slice(0, 5).map((d, i) => ({
              label: d.dept,
              value: d.items,
              color: ACCENT_COLORS[i % 4],
            }))}
          />
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">BUILD SEQUENCE</div>
            <h2 className="section-title">Schedule pulse</h2>
          </div>
          <CalendarDays color="#ff4fd8" size={22} />
        </div>
        <div className="timeline-track">
          {(DASHBOARD_ANALYTICS.schedule as Array<{ date?: string; phase?: string; details?: string; resource?: string }>).slice(0, 6).map((s, i) => (
            <div className="timeline-node" key={`${s.date ?? i}-${i}`}>
              <div className="tnode-dot" style={{ '--c': ACCENT_COLORS[i % 4] } as React.CSSProperties} />
              <div className="tnode-card glass-card">
                <div className="tnode-date">{s.date ?? '—'}</div>
                <div className="tnode-title">{s.phase ?? 'Scheduled operation'}</div>
                <div className="tnode-copy">{s.details ?? s.resource ?? ''}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TAB CARDS ── */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">WORKBOOK PAGES</div>
            <h2 className="section-title">All departments</h2>
            <p className="section-copy">Every tab converted into a rich interface — search, filter, and explore.</p>
          </div>
          <Layers color="#8b5cf6" size={22} />
        </div>
        <div className="tab-grid">
          {TAB_NAMES.map((tab, i) => {
            const item = EMBEDDED_SHEET_DATA[tab];
            return (
              <Link href={`/sheet/${encodeURIComponent(tab)}`} className="tab-card glass-card" key={tab}>
                <div className="tab-accent" style={{ background: ACCENT_COLORS[i % 4] }} />
                <div className="tab-top">
                  <div className="tab-name">{tab}</div>
                  <span className="pill">OPEN <ArrowRight size={11} /></span>
                </div>
                <p className="tab-desc">{item.headline}</p>
                <div className="tab-stats">
                  <div className="mini-stat"><strong>{item.nonEmptyRows}</strong><span>Rows</span></div>
                  <div className="mini-stat"><strong>{item.metrics.sections}</strong><span>Sections</span></div>
                  <div className="mini-stat"><strong>{item.maxCols}</strong><span>Cols</span></div>
                </div>
                <div className="tab-hover-glow" style={{ '--c': ACCENT_COLORS[i % 4] + '22' } as React.CSSProperties} />
              </Link>
            );
          })}
        </div>
      </section>

      <p className="footer-note mono">DATA SOURCE: Google Sheets · {DASHBOARD_KPIS.project} · {DASHBOARD_KPIS.venue} · {DASHBOARD_KPIS.location}</p>
    </main>
  );
}
