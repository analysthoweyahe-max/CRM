import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import { Sidebar }  from './components/Sidebar';
import { Topbar }   from './components/Topbar';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column — offset by sidebar width on large screens */}
      <div className="flex flex-col min-h-screen lg:ms-64 dark:bg-gray-950">
        <Topbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
