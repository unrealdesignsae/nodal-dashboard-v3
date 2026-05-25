import { Dashboard } from '@/components/Dashboard';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export const metadata = {
  title: 'EC26 Dashboard | Nodal Technical Consultancy',
};

export default function Page() {
  return (
    <div className="app-shell">
      <TopBar activeTab="dashboard" />
      <Sidebar active="dashboard" />
      <Dashboard />
    </div>
  );
}
