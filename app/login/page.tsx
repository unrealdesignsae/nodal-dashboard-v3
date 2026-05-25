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
      setError('Incorrect passcode. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">⬡</div>
          <div className="eyebrow" style={{ textAlign: 'center', marginTop: 8 }}>NODAL TECHNICAL CONSULTANCY</div>
          <h1 style={{ textAlign: 'center', fontSize: 22, margin: '8px 0 4px' }}>
            <span className="gradient-text">EC26 Dashboard</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#888', fontSize: 13, margin: 0 }}>Enter your access passcode</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="login-input"
            autoFocus
            autoComplete="current-password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn login-btn" disabled={loading || !passcode}>
            {loading ? 'Verifying…' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
