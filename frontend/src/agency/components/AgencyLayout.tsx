import { Outlet } from 'react-router-dom';
import AgencySidebar from './AgencySidebar';

const AgencyLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AgencySidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AgencyLayout;
