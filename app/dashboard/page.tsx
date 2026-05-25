import { Dashboard } from '@/components/Dashboard';
import { NodalFooter } from '@/components/NodalFooter';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const metadata = {
  title: 'Analytics Dashboard | EC26 Nodal Technical Consultancy',
};

export default function DashboardPage() {
  return (
    <div className="app-shell">
      <TopBar activeTab="dashboard" />
      <Sidebar active="dashboard" />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <Dashboard />
        <NodalFooter />
      </main>
    </div>
  );
}
