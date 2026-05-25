'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Wifi } from 'lucide-react';

export function SyncButton({ tab }: { tab?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error' | 'no-creds'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);

  async function handleSync() {
    setStatus('loading');
    try {
      const url = tab ? `/api/sheets/${encodeURIComponent(tab)}` : '/api/sheets';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      if (json.live === false && !tab) {
        setStatus('no-creds');
      } else if (json.live === false) {
        setStatus('no-creds');
      } else {
        setStatus('ok');
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  }

  const icons = {
    idle: <RefreshCw size={14} />,
    loading: <RefreshCw size={14} className="spin" />,
    ok: <CheckCircle size={14} />,
    error: <AlertCircle size={14} />,
    'no-creds': <Wifi size={14} />,
  };
  const labels = {
    idle: 'Sync from Sheet',
    loading: 'Syncing…',
    ok: `Synced ${lastSync ?? ''}`,
    error: 'Sync failed',
    'no-creds': 'No API key set',
  };
  const colors: Record<string, string> = {
    ok: '#b8ff63',
    error: '#ff4fd8',
    'no-creds': '#ffb347',
  };

  return (
    <button
      className="btn secondary sync-btn"
      onClick={handleSync}
      disabled={status === 'loading'}
      style={colors[status] ? { color: colors[status], borderColor: colors[status] + '66' } : {}}
      title={
        status === 'no-creds'
          ? 'Add GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY to Vercel env vars to enable live sync'
          : 'Pull latest data from Google Sheets'
      }
    >
      {icons[status]} {labels[status]}
    </button>
  );
}
