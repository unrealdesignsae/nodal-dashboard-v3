'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('ACCESS DENIED — incorrect passcode');
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        {/* Logo */}
        <img
          src="/brand/nodal-logo-mark.png"
          alt="Nodal Technical Consultancy"
          className="login-logo"
        />

        {/* Title */}
        <div className="login-title">
          <h1>EC26 DASHBOARD</h1>
          <p>NODAL TECHNICAL CONSULTANCY · RESTRICTED ACCESS</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="ENTER PASSCODE"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="login-input"
            autoFocus
            autoComplete="current-password"
            spellCheck={false}
          />
          {error && <div className="login-error">{error}</div>}
          <button
            type="submit"
            className="login-submit"
            disabled={loading || !passcode}
          >
            {loading ? 'VERIFYING…' : 'ENTER DASHBOARD →'}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          EC26 ELECTRIC CASTLE · MAINSTAGE · ADVANCING SHEET
        </p>
      </div>
    </div>
  );
}
