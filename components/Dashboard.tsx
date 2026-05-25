'use client';

import { useEffect, useRef, useState } from 'react';
import { useSheetData } from '@/lib/sheet-store';
import { EMBEDDED_SHEET_DATA } from '@/lib/sheet-data';

/* ─────────────────────────────────────────────
   DATA HELPERS
───────────────────────────────────────────── */

function s(v: unknown): string { return v == null ? '' : String(v).trim(); }
type SheetData = typeof EMBEDDED_SHEET_DATA;

function getTeam(sd: SheetData) {
  const out: { role: string; name: string; phone: string; email: string }[] = [];
  let in3 = false;
  for (const r of sd.OVERVIEW.rows) {
    const c0 = s(r.cells?.[0]).replace(':', '');
    if (c0.includes('3. PRODUCTION TEAM')) { in3 = true; continue; }
    if (c0.includes('4.')) break;
    if (!in3 || !c0 || c0 === 'Role') continue;
    const name = [s(r.cells?.[2]), s(r.cells?.[4])].filter(Boolean).join(' ');
    out.push({ role: c0, name, phone: s(r.cells?.[6]), email: s(r.cells?.[8]) });
  }
  return out;
}

function getSuppliers(sd: SheetData) {
  const out: { dept: string; company: string; contact: string }[] = [];
  let in4 = false;
  for (const r of sd.OVERVIEW.rows) {
    const c0 = s(r.cells?.[0]);
    if (c0.includes('4. SUPPLIERS')) { in4 = true; continue; }
    if (c0.includes('5.') || c0.includes('TABLE')) break;
    if (!in4 || !c0 || c0 === 'Discipline') continue;
    out.push({ dept: c0, company: s(r.cells?.[2]), contact: s(r.cells?.[4]) });
  }
  return out;
}

function getAlerts(team: ReturnType<typeof getTeam>, suppliers: ReturnType<typeof getSuppliers>) {
  const out: { level: 'high' | 'med'; text: string; note: string }[] = [];
  const keyRoles = ['Technical Manager', 'Power Crew Chief', 'Laser Operator', 'Stagehand Coordinator', 'Backline Responsible'];
  team.filter(t => keyRoles.includes(t.role) && !t.name).forEach(t =>
    out.push({ level: 'high', text: t.role, note: 'No crew assigned' })
  );
  suppliers.filter(s => !s.company).forEach(s =>
    out.push({ level: 'high', text: `${s.dept} supplier`, note: 'No company contracted' })
  );
  out.push({ level: 'med', text: 'Show dates TBD', note: 'Build + show days not confirmed' });
  out.push({ level: 'med', text: 'Emergency contact TBD', note: 'Site emergency number missing' });
  out.push({ level: 'med', text: 'Curfew / Last Act TBD', note: 'Show end time not set' });
  return out;
}

const PHASE: Record<string, { color: string; bg: string; label: string }> = {
  show:   { color: '#00ff88', bg: 'rgba(0,255,136,0.13)',  label: 'SHOW'   },
  build:  { color: '#00d4ff', bg: 'rgba(0,212,255,0.11)',  label: 'BUILD'  },
  prep:   { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'PREP'   },
  steel:  { color: '#f0b40a', bg: 'rgba(240,180,10,0.11)', label: 'OUT'    },
  travel: { color: '#64748b', bg: 'rgba(100,116,139,0.09)', label: 'TRAVEL' },
};

function getSchedule(sd: SheetData) {
  const out: { date: string; tag: string; detail: string; type: string }[] = [];
  for (const r of sd['Sheet1'].rows) {
    const date = s(r.cells?.[0]); const tag = s(r.cells?.[1]);
    const detail = s(r.cells?.[3]);
    const phaseRaw = s(r.cells?.[2]);
    if (!date || !/\d+\/Jul/i.test(date)) continue;
    const p = (phaseRaw + tag).toLowerCase();
    const type = p.includes('show') || /day [123]/.test(p) ? 'show'
      : p.includes('steel') || p.includes('load out') || p.includes('loading') ? 'steel'
      : p.includes('travel') ? 'travel'
      : p.includes('probe') || p.includes('program') || p.includes('day 0') ? 'prep'
      : 'build';
    out.push({ date, tag, detail, type });
  }
  return out;
}

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.floor(diff / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    sec: total % 60,
  };
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

/* ─────────────────────────────────────────────
   COUNTDOWN DIGIT
───────────────────────────────────────────── */

function Digit({ n, label }: { n: number; label: string }) {
  const str = String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: 10,
        padding: '8px 14px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 'clamp(22px, 3vw, 36px)',
        fontWeight: 800,
        color: '#00d4ff',
        letterSpacing: 2,
        minWidth: 64,
        textAlign: 'center',
        lineHeight: 1,
        textShadow: '0 0 20px rgba(0,212,255,0.5)',
        transition: 'all 0.3s ease',
      }}>
        {str}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(0,212,255,0.5)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */

function StatCard({ label, value, sub, color, delay = 0 }: {
  label: string; value: string; sub: string; color: string; delay?: number;
}) {
  const { ref, vis } = useInView();
  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 12,
        padding: '14px 16px',
        flex: 1,
        minWidth: 100,
        position: 'relative',
        overflow: 'hidden',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(12px)',
        transition: `all 0.4s ease ${delay}ms`,
        cursor: 'default',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 800, color, lineHeight: 1, marginBottom: 4, textShadow: `0 0 16px ${color}60` }}>
        {value}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
        {sub}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SWIMLANE TIMELINE
───────────────────────────────────────────── */

function Swimlane({ schedule }: { schedule: ReturnType<typeof getSchedule> }) {
  const lanes: Record<string, typeof schedule> = { show: [], build: [], prep: [], steel: [], travel: [] };
  for (const e of schedule) {
    if (lanes[e.type]) lanes[e.type].push(e);
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 16, background: '#00d4ff', borderRadius: 2 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)' }}>PRODUCTION SCHEDULE</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(PHASE).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.color }} />
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: v.color, letterSpacing: '0.08em' }}>{v.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px' }}>
          3 Jul – 26 Jul 2026
        </div>
      </div>

      {/* Lanes */}
      <div style={{ padding: '10px 0' }}>
        {Object.entries(lanes).map(([type, events]) => {
          if (!events.length) return null;
          const ph = PHASE[type];
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              {/* Lane label */}
              <div style={{ width: 70, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 18px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: ph.color, boxShadow: `0 0 6px ${ph.color}` }} />
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: ph.color, fontWeight: 700, letterSpacing: '0.1em' }}>{ph.label}</span>
              </div>
              {/* Events */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', padding: '2px 12px 2px 0', flex: 1 }}>
                {events.map((e, i) => {
                  const dateNum = e.date.replace('/Jul', '/Jul');
                  const label = e.tag || e.detail || '';
                  const short = label.length > 28 ? label.slice(0, 26) + '…' : label;
                  return (
                    <div key={i} title={`${e.date} — ${label}`} style={{
                      background: ph.bg,
                      border: `1px solid ${ph.color}30`,
                      borderRadius: 6,
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'default',
                      transition: 'border-color 0.2s',
                    }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, color: ph.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{dateNum}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{short}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ALERT FEED
───────────────────────────────────────────── */

function AlertFeed({ alerts }: { alerts: ReturnType<typeof getAlerts> }) {
  const high = alerts.filter(a => a.level === 'high');
  const med  = alerts.filter(a => a.level === 'med');

  const AlertRow = ({ a, i }: { a: typeof alerts[0]; i: number }) => {
    const isHigh = a.level === 'high';
    const col = isHigh ? '#ff4757' : '#f0b40a';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        opacity: 0,
        animation: `fadeSlide 0.3s ease ${i * 50}ms forwards`,
        cursor: 'default',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: `${col}18`, border: `1px solid ${col}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <line x1="3" y1="3" x2="9" y2="9" stroke={col} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="9" y1="3" x2="3" y2="9" stroke={col} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{a.text}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{a.note}</div>
        </div>
        <div style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: col, background: `${col}15`, border: `1px solid ${col}30`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em', flexShrink: 0 }}>
          {isHigh ? 'HIGH' : 'MED'}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      width: 'clamp(300px, 35%, 420px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 16, background: '#ff4757', borderRadius: 2 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)' }}>ACTION REQUIRED</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, color: '#ff4757', background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 6, padding: '3px 8px', letterSpacing: '0.08em' }}>
          {alerts.length} OPEN
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, maxHeight: 420 }}>
        {high.length > 0 && (
          <div style={{ padding: '8px 14px 4px', fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', color: '#ff475780', fontWeight: 700 }}>
            ▲ HIGH PRIORITY
          </div>
        )}
        {high.map((a, i) => <AlertRow key={i} a={a} i={i} />)}
        {med.length > 0 && (
          <div style={{ padding: '10px 14px 4px', fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', color: '#f0b40a80', fontWeight: 700 }}>
            ● MEDIUM PRIORITY
          </div>
        )}
        {med.map((a, i) => <AlertRow key={i} a={a} i={high.length + i} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */

export function Dashboard() {
  const sheetData  = useSheetData();
  const team       = getTeam(sheetData);
  const suppliers  = getSuppliers(sheetData);
  const alerts     = getAlerts(team, suppliers);
  const schedule   = getSchedule(sheetData);
  const teamOk     = team.filter(t => t.name).length;
  const suppOk     = suppliers.filter(s => s.company).length;
  const highCount  = alerts.filter(a => a.level === 'high').length;

  const showDate = new Date('2026-07-17T18:00:00');
  const { d, h, m, sec } = useCountdown(showDate);

  const stats = [
    { label: 'EVENT',     value: 'EC26',                       sub: 'Electric Castle',         color: '#00d4ff' },
    { label: 'VENUE',     value: 'MAINSTAGE',                  sub: 'Banffy Castle, Romania',  color: '#00d4ff' },
    { label: 'BUILD',     value: '12 DAYS',                    sub: '3 – 14 Jul 2026',         color: '#00d4ff' },
    { label: 'SHOW DAYS', value: '3',                          sub: '17 – 19 Jul 2026',        color: '#00ff88' },
    { label: 'TEAM',      value: `${teamOk}/${team.length}`,   sub: `${team.length - teamOk} unassigned`,    color: teamOk < team.length ? '#f0b40a' : '#00ff88' },
    { label: 'SUPPLIERS', value: `${suppOk}/${suppliers.length}`, sub: `${suppliers.length - suppOk} TBD`,   color: suppOk < suppliers.length ? '#f0b40a' : '#00ff88' },
    { label: 'ACTIONS',   value: String(highCount),            sub: 'high priority',           color: highCount > 0 ? '#ff4757' : '#00ff88' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0);   }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="main-content" style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: '100vh',
        boxSizing: 'border-box',
        position: 'relative',
      }}>

        {/* ── HERO HEADER ─────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
          flexWrap: 'wrap',
        }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(255,20,20,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, #ff2020, rgba(255,32,32,0.1), transparent)', pointerEvents: 'none' }} />

          {/* Left: Logo + Event Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1 }}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s ease infinite', boxShadow: '0 0 8px #00ff88' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                MAINSTAGE ADVANCING · NODAL TC
              </span>
            </div>

            {/* EC Logo */}
            <img
              src="/ec-logo.png"
              alt="Electric Castle 16–19 July 2026"
              style={{
                height: 'clamp(50px, 6.5vw, 90px)',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'left center',
                filter: 'drop-shadow(0 4px 24px rgba(255,20,20,0.45))',
              }}
            />

            {/* Sub info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                  Banffy Castle Domain · Bonțida, Romania
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                  16 – 19 July 2026
                </span>
              </div>
            </div>
          </div>

          {/* Right: Countdown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, zIndex: 1 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(0,212,255,0.55)', fontWeight: 700 }}>
              SHOWTIME COUNTDOWN
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <Digit n={d}   label="DAYS" />
              <div style={{ fontFamily: 'monospace', fontSize: 24, color: 'rgba(0,212,255,0.4)', lineHeight: 1, paddingBottom: 18 }}>:</div>
              <Digit n={h}   label="HRS"  />
              <div style={{ fontFamily: 'monospace', fontSize: 24, color: 'rgba(0,212,255,0.4)', lineHeight: 1, paddingBottom: 18 }}>:</div>
              <Digit n={m}   label="MIN"  />
              <div style={{ fontFamily: 'monospace', fontSize: 24, color: 'rgba(0,212,255,0.4)', lineHeight: 1, paddingBottom: 18 }}>:</div>
              <Digit n={sec} label="SEC"  />
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em',
              color: '#00ff88', background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.25)', borderRadius: 6, padding: '4px 10px',
              textShadow: '0 0 10px rgba(0,255,136,0.4)',
            }}>
              17 – 19 July 2026 · Show Days
            </div>
          </div>
        </div>

        {/* ── STAT BAR ─────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {stats.map((st, i) => (
            <StatCard key={i} {...st} delay={i * 60} />
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────── */}
        <div style={{ display: 'flex', gap: 14, flex: 1, alignItems: 'flex-start', minHeight: 0 }}>
          <Swimlane schedule={schedule} />
          <AlertFeed alerts={alerts} />
        </div>

      </div>
    </>
  );
}
