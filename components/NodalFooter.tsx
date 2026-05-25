'use client';

export function NodalFooter() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(0,0,0,0.3)',
      padding: '28px 32px',
      marginTop: 'auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
        maxWidth: 1400,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <img
            src="/brand/nodal-logo-mark.png"
            alt="Nodal TC"
            style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)' }}>
            NODAL TECHNICAL CONSULTANCY
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            FZ-LLC · Dubai, UAE · Global Delivery
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', marginTop: 4 }}>
            Precision Event Engineering
          </div>
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(0,212,255,0.5)', fontWeight: 700, marginBottom: 4 }}>
            CONTACT
          </div>
          <a href="mailto:info@nodaltc.com" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>info@nodaltc.com</span>
          </a>
          <a href="tel:+971501234567" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>+971 50 123 4567</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Dubai, UAE</span>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(0,212,255,0.5)', fontWeight: 700, marginBottom: 4 }}>
            LINKS
          </div>
          {[
            { label: 'nodaltc.com', href: 'https://nodaltc.com' },
            { label: 'nodaltech.ae', href: 'https://nodaltech.ae' },
            { label: '@nodaltech', href: 'https://twitter.com/nodaltech' },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
            </a>
          ))}
        </div>

        {/* Accepting briefs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em',
            color: '#00ff88', background: 'rgba(0,255,136,0.07)',
            border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6,
            padding: '6px 12px',
          }}>
            ACCEPTING BRIEFS 2026 – 2027
          </div>
          <a href="https://nodaltc.com/#contact" target="_blank" rel="noreferrer" style={{
            fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em',
            color: '#00d4ff', textDecoration: 'none',
            borderBottom: '1px solid rgba(0,212,255,0.3)',
            paddingBottom: 2,
          }}>
            Start a conversation →
          </a>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 8 }}>
            EC26 · MAINSTAGE ADVANCING · INTERNAL
          </div>
        </div>

      </div>
    </footer>
  );
}
