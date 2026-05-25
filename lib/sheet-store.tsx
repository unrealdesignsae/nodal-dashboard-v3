'use client';

/**
 * sheet-store.ts
 * ──────────────
 * Client-side live data layer.
 *
 * • On mount: reads localStorage cache (so refreshes don't revert).
 * • On sync:  fetches every tab from /api/sheets/[tab], merges the
 *             returned row arrays back into the same shape as
 *             EMBEDDED_SHEET_DATA, caches to localStorage.
 * • Exposes:  useSheetData() hook → always the freshest data.
 *             useSync()      hook → { sync, status, lastSynced }
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { EMBEDDED_SHEET_DATA, TAB_NAMES } from '@/lib/sheet-data';

// ── Types ──────────────────────────────────────────────────────────────

type SheetData = typeof EMBEDDED_SHEET_DATA;
export type SyncStatus = 'idle' | 'loading' | 'ok' | 'error' | 'no-creds';

interface StoreCtx {
  data: SheetData;
  status: SyncStatus;
  lastSynced: string | null;
  /** true when data in state is newer than the embedded snapshot */
  isLive: boolean;
  sync: () => Promise<void>;
}

const STORAGE_KEY = 'nodal_sheet_cache_v3';

// ── Helpers ────────────────────────────────────────────────────────────

function processRawValues(
  tabName: string,
  rawValues: (string | null)[][],
  embedded: SheetData[keyof SheetData]
): SheetData[keyof SheetData] {
  if (!rawValues || rawValues.length === 0) return embedded;

  const rows = rawValues.map((raw, idx) => {
    const cells = (raw ?? []).map((c) =>
      c === '' || c === null || c === undefined ? null : c
    );
    return { rowNumber: idx + 1, cells };
  });

  const nonEmptyRows = rows.filter((r) => r.cells.some((c) => c !== null)).length;
  const maxCols = Math.max(0, ...rows.map((r) => r.cells.length));

  let headline = tabName;
  for (const row of rows) {
    const filled = row.cells.filter((c) => c !== null);
    if (filled.length > 0) {
      headline = String(filled[0]);
      break;
    }
  }

  return {
    ...embedded,
    title: tabName,
    headline,
    rowCount: rawValues.length,
    nonEmptyRows,
    maxCols,
    rows,
  } as SheetData[keyof SheetData];
}

function loadCache(): SheetData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SheetData;
  } catch {
    return null;
  }
}

function saveCache(data: SheetData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

// ── Context ────────────────────────────────────────────────────────────

const SheetStoreContext = createContext<StoreCtx>({
  data: EMBEDDED_SHEET_DATA,
  status: 'idle',
  lastSynced: null,
  isLive: false,
  sync: async () => {},
});

// ── Provider ───────────────────────────────────────────────────────────

export function SheetStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SheetData>(EMBEDDED_SHEET_DATA);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const isSyncing = useRef(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setData(cached);
      setIsLive(true);
      const ts = localStorage.getItem(STORAGE_KEY + '_ts');
      if (ts) setLastSynced(ts);
    }
  }, []);

  const sync = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setStatus('loading');

    try {
      // Single call to live-sync API — fetches all tabs from Google Sheets
      // server-side on Vercel. Works even when the user's PC is off.
      const res = await fetch('/api/live-sync', { cache: 'no-store' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { ok: boolean; data: SheetData; synced: string };

      if (!json.ok || !json.data) {
        setStatus('no-creds');
        setTimeout(() => setStatus('idle'), 6000);
        return;
      }

      // Merge live rows into current state
      const next = { ...data } as SheetData;
      for (const [tab, tabData] of Object.entries(json.data)) {
        const key = tab as keyof SheetData;
        if (EMBEDDED_SHEET_DATA[key] && tabData) {
          next[key] = {
            ...EMBEDDED_SHEET_DATA[key],
            ...tabData,
          } as never;
        }
      }

      const ts = new Date().toLocaleTimeString();
      setData(next);
      setIsLive(true);
      setLastSynced(ts);
      saveCache(next);
      localStorage.setItem(STORAGE_KEY + '_ts', ts);
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    } finally {
      isSyncing.current = false;
    }
  }, [data]);

  return (
    <SheetStoreContext.Provider value={{ data, status, lastSynced, isLive, sync }}>
      {children}
    </SheetStoreContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────

/** Returns the current sheet data (embedded or live-synced). */
export function useSheetData(): SheetData {
  return useContext(SheetStoreContext).data;
}

/** Returns sync controls and status. */
export function useSync() {
  const { sync, status, lastSynced, isLive } = useContext(SheetStoreContext);
  return { sync, status, lastSynced, isLive };
}
