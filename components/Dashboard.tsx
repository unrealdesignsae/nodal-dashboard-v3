'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { EMBEDDED_SHEET_DATA, TAB_NAMES, DASHBOARD_ANALYTICS } from '@/lib/sheet-data';

/* ── Count-up animation (same as ec26-v2) ── */
function CountUp({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          cur += step;
          if (cur >= target) { setCount(target); clearInterval(timer); }
          else { setCount(Math.floor(cur)); }
        }, 16);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ── Parse OVERVIEW data ── */
function parseOverview() {
  const rows = EMBEDDED_SHEET_DATA.OVERVIEW.rows;

  // Project info: rows 4-12
  const projectInfo: { label: string; value: string }[] = [];
  for (const row of rows) {
    const c = row.cells;
    if (!c || c.length < 3) continue;
    const label = (c[0] ?? '').replace(':', '').trim();
    const value = (c[2] ?? '').trim();
    if (!label || !value) continue;
    if (['Project Name', 'Event / Festival', 'Stage', 'Venue', 'Location / Address',
         'GPS Coordinates', 'Version', 'Date', 'DASHBOARD DESIGN'].includes(label)) {
      projectInfo.push({ label, value });
    }
  }

  // Show dates: rows 13-19
  const showDates: { label: string; value: string }[] = [];
  for (const row of rows) {
    const c = row.cells;
    if (!c || c.length < 3) continue;
    const label = (c[0] ?? '').replace(':', '').trim();
    const value = (c[2] ?? '').trim();
    if (['Build Start', 'Show Day 1', 'Show Day 2', 'Show Day 3', 'Show Day 4', 'Load Out End'].includes(label)) {
      showDates.push({ label, value });
    }
  }

  // Team: rows 22-onwards, cells at [0],[2],[4],[6],[8]
  const team: { role: string; name: string; phone: string; email: string }[] = [];
  let inTeam = false;
  for (const row of rows) {
    const c = row.cells;
    if (!c) continue;
    if ((c[0] ?? '').includes('3. PRODUCTION TEAM')) { inTeam = true; continue; }
    if ((c[0] ?? '').includes('4.')) { inTeam = false; break; }
    if (!inTeam) continue;
    const role = (c[0] ?? '').trim();
    if (!role || role === 'Role') continue;
    const firstName = (c[2] ?? '').trim();
    const lastName  = (c[4] ?? '').trim();
    const phone = (c[6] ?? '').trim();
    const email = (c[8] ?? '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || '—';
    team.push({ role, name, phone, email });
  }

  return { projectInfo, showDates, team };
}

/* ── Discipline metrics pulled from DASHBOARD_ANALYTICS ── */
const DISCIPLINE_METRICS = [
  { tab: 'AUDIO',      label: 'AUDIO',      unit: 'units',    key: 'AUDIO' },
  { tab: 'LIGHTING',   label: 'LIGHTING',   unit: 'fixtures', key: 'LIGHTING' },
  { tab: 'VIDEO - LED',label: 'VIDEO / LED',unit: 'tiles',    key: 'VIDEO - LED' },
  { tab: 'SFX - PYRO', label: 'SFX / PYRO', unit: 'effects',  key: 'SFX - PYRO' },
  { tab: 'LASER',      label: 'LASER',      unit: 'units',    key: 'LASER' },
  { tab: 'BROADCAST',  label: 'BROADCAST',  unit: 'units',    key: 'BROADCAST' },
];

function getDisciplineCount(tab: string): number {
  const dept = DASHBOARD_ANALYTICS.departmentItems.find(
    d => d.dept.toUpperCase() === tab.toUpperCase() ||
         d.dept.toUpperCase().includes(tab.split(' - ')[0])
  );
  return dept?.items ?? EMBEDDED_SHEET_DATA[tab as keyof typeof EMBEDDED_SHEET_DATA]?.nonEmptyRows ?? 0;
}

export function Dashboard() {
  const { projectInfo, showDates, team } = parseOverview();

  return (
    <div className="main-content">

      {/* ── Badge + Title ── */}
      <div className="badge">
        <span className="badge-dot" />
        ADVANCING SHEET
      </div>

      <h1 className="page-title">EC26 ELECTRIC CASTLE MAINSTAGE</h1>
      <p className="page-subtitle">
        Banffy Castle Domain · Bonțida, Romania · v01 · Nodal Technical Consultancy
      </p>

      {/* ── Discipline metric cards ── */}
      <div className="metrics-grid stagger">
        {DISCIPLINE_METRICS.map(({ tab, label, unit }) => {
          const count = getDisciplineCount(tab);
          return (
            <Link
              key={tab}
              href={`/sheet/${encodeURIComponent(tab)}`}
              className="metric-card"
              style={{ textDecoration: 'none' }}
            >
              <div className="metric-discipline">{label}</div>
              <div className="metric-value">
                <CountUp target={count} />
              </div>
              <div className="metric-unit">{unit}</div>
            </Link>
          );
        })}
      </div>

      {/* ── Info panels ── */}
      <div className="panels-grid">

        {/* Project info */}
        <div className="panel">
          <div className="panel-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            PROJECT INFO
          </div>
          <div className="panel-body">
            {projectInfo.map(({ label, value }) => (
              <div className="info-row" key={label}>
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
            <div className="panel-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', marginTop: 4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              SHOW DATES
            </div>
            {showDates.map(({ label, value }) => (
              <div className="info-row" key={label}>
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All disciplines quick-nav */}
        <div className="panel">
          <div className="panel-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            </svg>
            ALL DEPARTMENTS
          </div>
          <div className="panel-body">
            {TAB_NAMES.map((tab) => {
              const data = EMBEDDED_SHEET_DATA[tab as keyof typeof EMBEDDED_SHEET_DATA];
              return (
                <Link
                  key={tab}
                  href={`/sheet/${encodeURIComponent(tab)}`}
                  className="info-row"
                  style={{ display: 'grid', textDecoration: 'none', cursor: 'pointer' }}
                >
                  <span className="info-label">{tab}</span>
                  <span className="info-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{data?.nonEmptyRows ?? 0} rows</span>
                    <span style={{ color: 'var(--accent)', fontSize: '12px' }}>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Production team roster ── */}
      {team.length > 0 && (
        <div className="panel" style={{ marginBottom: '32px' }}>
          <div className="panel-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            PRODUCTION TEAM
          </div>
          <div className="panel-body">
            {/* Header */}
            <div className="roster-row" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,212,255,0.03)' }}>
              <span className="info-label">ROLE</span>
              <span className="info-label">NAME</span>
              <span className="info-label">CONTACT</span>
            </div>
            {team.map(({ role, name, phone, email }) => (
              <div className="roster-row" key={role + name}>
                <span className="roster-role">{role}</span>
                <span className="roster-name">{name}</span>
                <span className="roster-contact">{phone || email || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        DATA SOURCE: GOOGLE SHEETS · EC26 ELECTRIC CASTLE MAINSTAGE · BANFFY CASTLE DOMAIN, BONȚIDA, ROMANIA
      </p>
    </div>
  );
}
