import { AllSheetsPage } from '@/components/AllSheetsPage';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const metadata = {
  title: 'All Sheets | EC26 Nodal Technical Consultancy',
};

export default function SheetsPage() {
  return (
    <div className="app-shell">
      <TopBar activeTab="sheets" />
      <Sidebar active="sheets" />
      <AllSheetsPage />
    </div>
  );
}
