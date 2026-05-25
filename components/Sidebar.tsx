import Link from 'next/link';
import { ExternalLink, Sheet } from 'lucide-react';
import { TAB_NAMES, SHEET_ID } from '@/lib/sheet-data';

const SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

export function Sidebar({ active = 'dashboard' }: { active?: string }) {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand-card" style={{ display: 'block' }}>
        <img src="/brand/nodal-logo-mark.png" alt="Nodal Technical Consultancy" className="logo" />
        <div className="brand-kicker">NODAL_TC · DUBAI FIELD OPS</div>
        <div className="brand-title">EC26 Advancing Control Interface</div>
        <p className="brand-sub">Every Signal. Every Node. Precisely Engineered.</p>
      </Link>

      {/* ── Google Sheets shortcut ── */}
      <a
        href={SHEETS_URL}
        target="_blank"
        rel="noreferrer"
        className="sheets-shortcut"
      >
        <Sheet size={14} />
        <span>Open Google Sheet</span>
        <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.6 }} />
      </a>

      <nav className="nav" aria-label="Workbook navigation">
        <Link href="/" className={`nav-link ${active === 'dashboard' ? 'active' : ''}`}>
          <span>Main Dashboard</span><span className="nav-dot" />
        </Link>
        {TAB_NAMES.map((tab) => (
          <Link key={tab} href={`/sheet/${encodeURIComponent(tab)}`} className={`nav-link ${active === tab ? 'active' : ''}`}>
            <span>{tab}</span><span className="nav-dot" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
