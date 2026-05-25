'use client';

import { SHEET_ID } from '@/lib/sheet-data';
import { useSync } from '@/lib/sheet-store';
import { ThemeToggle } from '@/components/ThemeProvider';

const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

export function TopBar({ activeTab }: { activeTab?: string }) {
  const { sync, status, lastSynced, isLive } = useSync();

  const btnLabel =
    status === 'loading'  ? 'SYNCING…' :
    status === 'ok'       ? `SYNCED ${lastSynced ?? ''}` :
    status === 'error'    ? 'SYNC FAILED' :
    status === 'no-creds' ? 'NO API KEY' :
    isLive                ? `LIVE · ${lastSynced ?? ''}` :
    'SYNC';

  const btnClass = `btn ${
    status === 'ok'    ? 'ok' :
    status === 'error' || status === 'no-creds' ? 'error' :
    status === 'loading' ? 'loading' : ''
  }`;

  const dotColor =
    status === 'ok' || isLive   ? '#00ff88' :
    status === 'error' || status === 'no-creds' ? '#ff4757' :
    status === 'loading'         ? '#00d4ff' :
    '#64748b';

  return (
    <header style={{
      width: '100%',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'linear-gradient(180deg, rgba(255,20,20,0.07) 0%, rgba(255,20,20,0.02) 40%, transparent 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Red top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #ff2020 0%, rgba(255,32,32,0.4) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top strip — controls row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px 0',
        gap: 12,
      }}>
        {/* Left: live status + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}80`,
            animation: (status === 'ok' || isLive) ? 'pulse 2s ease infinite' : 'none',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10, letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.35)', fontWeight: 600,
          }}>
            MAINSTAGE ADVANCING · NODAL TC
          </span>
          {activeTab && activeTab !== 'dashboard' && (
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              / {activeTab.toUpperCase()}
            </span>
          )}
          {isLive && status === 'idle' && lastSynced && (
            <span style={{
              fontFamily: 'monospace', fontSize: 8, color: '#00ff88',
              background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 4, padding: '2px 7px', letterSpacing: '0.08em',
            }}>● LIVE · {lastSynced}</span>
          )}
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className={btnClass}
            onClick={sync}
            disabled={status === 'loading'}
            title="Pull latest data from Google Sheets"
            style={{ fontSize: '10px', padding: '5px 12px' }}
          >
            {status === 'loading' && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="spin" style={{ marginRight: 5 }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            )}
            {btnLabel}
          </button>
          <a
            href={SHEETS_URL}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ fontSize: '10px', padding: '5px 12px' }}
            title="Open Google Sheet"
          >
            SHEET
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>

      {/* EC LOGO — full-width hero header */}
      <div style={{ padding: '14px 24px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <img
          src="/ec-logo.png"
          alt="Electric Castle 16–19 July 2026"
          style={{
            height: 'clamp(52px, 8vw, 110px)',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block',
            filter: 'drop-shadow(0 4px 28px rgba(255,20,20,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
          }}
        />
        {/* Meta info aligned right of logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              Banffy Castle Domain · Bonțida, Romania
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              16 – 19 July 2026 · 3 Show Days
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation: spin 0.9s linear infinite; }
      `}</style>
    </header>
  );
}
