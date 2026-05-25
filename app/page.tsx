import { Dashboard } from '@/components/Dashboard';
import { Sidebar } from '@/components/Sidebar';

export default function Page() {
  return (
    <div className="app-shell">
      <Sidebar active="dashboard" />
      <Dashboard />
    </div>
  );
}
