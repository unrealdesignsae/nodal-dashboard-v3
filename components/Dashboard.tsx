'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { EMBEDDED_SHEET_DATA, TAB_NAMES } from '@/lib/sheet-data';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA LAYER — extract real info from sheets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function s(v: unknown): string {
  return v === null || v === undefined ? '' : String(v).trim();
}
function isTBD(v: string) {
  return !v || /^tbd$/i.test(v.trim());
}

// ── Production team from OVERVIEW §3 ──
function getTeam() {
  const rows = EMBEDDED_SHEET_DATA.OVERVIEW.rows;
  const team: { role: string; firstName: string; lastName: string; phone: string; email: string }[] = [];
  let inTeam = false;
  for (const r of rows) {
    const c0 = s(r.cells?.[0]).replace(':', '');
    if (c0.includes('3. PRODUCTION TEAM')) { inTeam = true; continue; }
    if (c0.includes('4.')) break;
    if (!inTeam || !c0 || c0 === 'Role') continue;
    team.push({
      role: c0,
      firstName: s(r.cells?.[2]),
      lastName:  s(r.cells?.[4]),
      phone:     s(r.cells?.[6]),
      email:     s(r.cells?.[8]),
    });
  }
  return team;
}

// ── Suppliers from OVERVIEW §4 ──
function getSuppliers() {
  const rows = EMBEDDED_SHEET_DATA.OVERVIEW.rows;
  const list: { dept: string; company: string; contact: string; phone: string; email: string }[] = [];
  let inSupp = false;
  for (const r of rows) {
    const c0 = s(r.cells?.[0]);
    if (c0.includes('4. SUPPLIERS')) { inSupp = true; continue; }
    if (c0.includes('5.') || c0.includes('TABLE')) break;
    if (!inSupp || !c0 || c0 === 'Discipline') continue;
    list.push({
      dept:    c0,
      company: s(r.cells?.[2]),
      contact: s(r.cells?.[4]),
      phone:   s(r.cells?.[6]),
      email:   s(r.cells?.[8]),
    });
  }
  return list;
}

// ── Schedule timeline from Sheet1 ──
const PHASE_TYPE = {
  show:   { color: '#00ff88', bg: 'rgba(0,255,136,0.08)', label: 'SHOW DAY' },
  build:  { color: '#00d4ff', bg: 'rgba(0,212,255,0.07)', label: 'BUILD' },
  prep:   { color: '#a855f7', bg: 'rgba(168,85,247,0.07)', label: 'PREP' },
  steel:  { color: '#f0b40a', bg: 'rgba(240,180,10,0.07)', label: 'LOAD OUT' },
  travel: { color: '#8892a4', bg: 'rgba(136,146,164,0.06)', label: 'TRAVEL' },
} as const;
type PhaseType = keyof typeof PHASE_TYPE;

function getSchedule() {
  const rows = EMBEDDED_SHEET_DATA['Sheet1'].rows;
  const events: { date: string; dayTag: string; phase: string; detail: string; type: PhaseType }[] = [];
  for (const r of rows) {
    const date   = s(r.cells?.[0]);
    const dayTag = s(r.cells?.[1]);
    const phase  = s(r.cells?.[2]);
    const detail = s(r.cells?.[3]);
    if (!date || !/\d+\/Jul/i.test(date)) continue;
    const p = (phase + dayTag).toLowerCase();
    let type: PhaseType =
      p.includes('show') || /day [123]/.test(p) ? 'show' :
      p.includes('steel') || p.includes('load out') || p.includes('loadings') ? 'steel' :
      p.includes('travel') ? 'travel' :
      p.includes('probe') || p.includes('program') || p.includes('day 0') ? 'prep' :
      'build';
    events.push({ date, dayTag, phase, detail, type });
  }
  return events;
}

// ── Critical alerts: TBD items that MATTER ──
function getAlerts() {
  const team = getTeam();
  const suppliers = getSuppliers();
  const alerts: { level: 'high' | 'med'; label: string; detail: string }[] = [];

  // Missing crew (high priority roles)
  const keyRoles = ['Technical Manager', 'Power Crew Chief', 'Laser Operator', 'Stagehand Coordinator', 'Backline Responsible'];
  team.filter(t => keyRoles.includes(t.role) && !t.firstName).forEach(t => {
    alerts.push({ level: 'high', label: `${t.role} — Unassigned`, detail: 'No crew member assigned to this role' });
  });

  // Missing suppliers
  suppliers.filter(s => !s.company).forEach(s => {
    alerts.push({ level: 'high', label: `${s.dept} supplier TBD`, detail: 'No company contracted yet' });
  });

  // Show dates
  alerts.push({ level: 'med', label: 'Show dates not confirmed', detail: 'Build start, show days & load out still TBD July 2026' });
  alerts.push({ level: 'med', label: 'Emergency number TBD', detail: 'Site emergency contact not yet assigned' });
  alerts.push({ level: 'med', label: 'Nearest hospital TBD', detail: 'Medical facility for Bonțida area not confirmed' });
  alerts.push({ level: 'med', label: 'Curfew / Last Act TBD', detail: 'Show end time not confirmed' });

  return alerts;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION WRAPPER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Section({ title, badge, badgeRed, accent = '#00d4ff', children }: {
  title: string; badge?: string; badgeRed?: boolean; accent?: string; children: React.ReactNode;
}) {
  return (
    <div className="db-card">
      <div className="db-card-head">
        <div className="db-card-title">
          <span className="db-title-dot" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
          {title}
        </div>
        {badge && (
          <span className={`db-badge${badgeRed ? ' db-badge-red' : ''}`}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Timeline() {
  const events = getSchedule();
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Section title="Production Schedule" badge="3 Jul – 26 Jul 2026" accent="#00d4ff">
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '10px 18px 6px', borderBottom: '1px solid var(--border)' }}>
        {(Object.entries(PHASE_TYPE) as [PhaseType, typeof PHASE_TYPE[PhaseType]][]).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
            {v.label}
          </span>
        ))}
      </div>

      <div ref={ref} className="tl-list" style={{ padding: '8px 0 4px', maxHeight: 480 }}>
        {events.map((ev, i) => {
          const cfg = PHASE_TYPE[ev.type];
          return (
            <div key={i} className="tl-item" style={{
              borderLeftColor: cfg.color,
              background: cfg.bg,
              opacity: vis ? 1 : 0,
              transform: vis ? 'none' : 'translateX(-12px)',
              transition: `opacity 300ms ease ${i * 25}ms, transform 300ms ease ${i * 25}ms`,
            }}>
              <div className="tl-date">{ev.dayTag ? <><strong style={{ color: cfg.color }}>{ev.dayTag}</strong> · {ev.date}</> : ev.date}</div>
              <div className="tl-phase" style={{ color: cfg.color }}>{ev.phase}</div>
              {ev.detail && <div className="tl-detail">{ev.detail}</div>}
              <span className="tl-tag" style={{ color: cfg.color, borderColor: cfg.color + '35', background: cfg.bg }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CRITICAL ALERTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Alerts() {
  const alerts = getAlerts();
  const high = alerts.filter(a => a.level === 'high');
  const med  = alerts.filter(a => a.level === 'med');

  return (
    <Section title="Action Required" badge={`${alerts.length} open`} badgeRed accent="#ff4757">
      <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {high.length > 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#ff4757', marginBottom: 4 }}>
            ● HIGH PRIORITY
          </div>
        )}
        {high.map((a, i) => (
          <div key={i} className="alert-row alert-high">
            <span className="alert-icon">✗</span>
            <div>
              <div className="alert-label">{a.label}</div>
              <div className="alert-detail">{a.detail}</div>
            </div>
          </div>
        ))}
        {med.length > 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#f0b40a', marginTop: 6, marginBottom: 4 }}>
            ● PENDING
          </div>
        )}
        {med.map((a, i) => (
          <div key={i} className="alert-row alert-med">
            <span className="alert-icon">⚠</span>
            <div>
              <div className="alert-label">{a.label}</div>
              <div className="alert-detail">{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TEAM ROSTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TeamRoster() {
  const team = getTeam();
  const confirmed = team.filter(t => t.firstName);
  const missing   = team.filter(t => !t.firstName);

  return (
    <Section
      title="Production Team"
      badge={`${confirmed.length} / ${team.length} assigned`}
      badgeRed={missing.length > 0}
      accent="#a855f7"
    >
      <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {team.map((m, i) => {
          const name = [m.firstName, m.lastName].filter(Boolean).join(' ');
          const ok = !!m.firstName;
          return (
            <div key={i} className={`team-row ${ok ? '' : 'team-row-missing'}`}>
              <div className="team-row-avatar" style={{
                background: ok ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'transparent',
                border: ok ? 'none' : '1px dashed #4a5568',
                color: ok ? '#fff' : '#ff4757',
              }}>
                {ok ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="team-row-role">{m.role}</div>
                <div className="team-row-name" style={{ color: ok ? 'var(--text)' : '#ff4757' }}>
                  {ok ? name : 'TBD — Unassigned'}
                </div>
              </div>
              {ok && m.phone && <div className="team-row-phone">{m.phone}</div>}
              {!ok && <span className="tbd-flag">TBD</span>}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUPPLIER STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SupplierStatus() {
  const suppliers = getSuppliers();
  const confirmed = suppliers.filter(s => s.company);
  const missing   = suppliers.filter(s => !s.company);

  return (
    <Section
      title="Suppliers & Companies"
      badge={`${missing.length} unconfirmed`}
      badgeRed={missing.length > 0}
      accent="#f0b40a"
    >
      <div style={{ padding: '8px 18px 14px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Discipline', 'Company', 'Contact', ''].map((h, i) => (
                <th key={i} style={{ padding: '6px 8px 8px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => {
              const ok = !!s.company;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: ok ? 1 : 0.85 }}>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{s.dept}</td>
                  <td style={{ padding: '8px 8px', fontWeight: 500, color: ok ? 'var(--text)' : '#ff4757' }}>{s.company || 'TBD'}</td>
                  <td style={{ padding: '8px 8px', color: 'var(--text-secondary)', fontSize: 11 }}>{s.contact || '—'}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: ok ? '#00ff88' : '#ff4757', fontSize: 14 }}>{ok ? '✓' : '✗'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCIPLINE QUICK LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const DEPT_ICONS: Record<string, string> = {
  OVERVIEW: '🏛', Sheet1: '📅', AUDIO: '🔊', LIGHTING: '💡',
  'VIDEO - LED': '🖥', LASER: '⚡', 'SFX - PYRO': '🔥',
  POWER: '⚡', RIGGING: '🔩', BACKLINE: '🎸', BROADCAST: '📡', STAGING: '🏗',
};
const DEPT_COLORS: Record<string, string> = {
  AUDIO: '#00d4ff', LIGHTING: '#f0b40a', 'VIDEO - LED': '#a855f7',
  LASER: '#00ff88', 'SFX - PYRO': '#ff6b35', POWER: '#ff4757',
  RIGGING: '#8892a4', BACKLINE: '#00d4ff', BROADCAST: '#a855f7', STAGING: '#f0b40a',
};

function DisciplineGrid() {
  const depts = TAB_NAMES.filter(t => t !== 'OVERVIEW');
  return (
    <Section title="Discipline Sheets" badge={`${depts.length} tabs`} accent="#00d4ff">
      <div className="dept-grid" style={{ padding: '12px 18px 16px' }}>
        {depts.map(tab => {
          const data = EMBEDDED_SHEET_DATA[tab as keyof typeof EMBEDDED_SHEET_DATA];
          const color = DEPT_COLORS[tab] || '#00d4ff';
          const rows = data?.nonEmptyRows ?? 0;
          const href = tab === 'Sheet1' ? '/sheet/Sheet1' : `/sheet/${encodeURIComponent(tab)}`;
          return (
            <Link key={tab} href={href} className="dept-chip" style={{ '--dept-color': color } as React.CSSProperties}>
              <span className="dept-icon">{DEPT_ICONS[tab] || '📋'}</span>
              <span className="dept-info">
                <span className="dept-name">{tab === 'Sheet1' ? 'SCHEDULE' : tab}</span>
                <span className="dept-rows">{rows} rows</span>
              </span>
              <span className="dept-arrow">→</span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function Dashboard() {
  const team      = getTeam();
  const suppliers = getSuppliers();
  const alerts    = getAlerts();

  const teamConf = team.filter(t => t.firstName).length;
  const suppConf = suppliers.filter(s => s.company).length;

  const kpis = [
    { label: 'Event', value: 'EC26', sub: 'Electric Castle 2026', color: '#00d4ff' },
    { label: 'Stage', value: 'MAIN', sub: 'Banffy Castle, Romania', color: '#00d4ff' },
    { label: 'Team', value: `${teamConf}/${team.length}`, sub: `${team.length - teamConf} unassigned`, color: team.length - teamConf > 0 ? '#ff4757' : '#00ff88' },
    { label: 'Suppliers', value: `${suppConf}/${suppliers.length}`, sub: `${suppliers.length - suppConf} TBD`, color: suppliers.length - suppConf > 0 ? '#f0b40a' : '#00ff88' },
    { label: 'Actions', value: String(alerts.length), sub: `${alerts.filter(a => a.level === 'high').length} high priority`, color: '#ff4757' },
  ];

  return (
    <div className="main-content dash-main">

      {/* ── Hero ── */}
      <div className="dash-hero" style={{ marginBottom: 18 }}>
        <div className="dash-hero-scan" />
        <div className="dash-hero-inner">
          <div className="dash-eyebrow"><span className="eyebrow-dot" />EC26 · MAINSTAGE · ADVANCING BRIEF</div>
          <h1 className="dash-title">Electric Castle 2026</h1>
          <p className="dash-sub">Banffy Castle Domain · Bonțida, Romania &nbsp;·&nbsp; Build 3 Jul → Show 17–19 Jul → Strike 26 Jul</p>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="db-kpi-row" style={{ marginBottom: 18 }}>
        {kpis.map((k, i) => (
          <div key={k.label} className="db-kpi" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="db-kpi-label">{k.label}</div>
            <div className="db-kpi-value" style={{ color: k.color, fontSize: 26 }}>{k.value}</div>
            <div className="db-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="db-grid">
        {/* Left — timeline (tall) + discipline grid */}
        <div className="db-col-left">
          <Timeline />
          <DisciplineGrid />
        </div>

        {/* Right — alerts + team + suppliers */}
        <div className="db-col-right">
          <Alerts />
          <TeamRoster />
          <SupplierStatus />
        </div>
      </div>

      <p className="dash-footer-note">
        NODAL TECHNICAL CONSULTANCY · EC26 ELECTRIC CASTLE MAINSTAGE · v01
      </p>
    </div>
  );
}
