import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import { AppSidebar }       from './components/AppSidebar';
import { Topbar }           from './components/Topbar';
import { AttendanceWidget } from './components/AttendanceWidget';
import { ROUTES }           from '@/app/router/routes';

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppSidebar
        variant="employee"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(p => !p)}
        footerWidget={<AttendanceWidget />}
      />

      <div className={[
        'flex flex-col min-h-screen dark:bg-gray-950',
        'transition-all duration-300',
        collapsed ? 'lg:ms-16' : 'lg:ms-64',
      ].join(' ')}>
        <Topbar
          onMenuToggle={() => setSidebarOpen(p => !p)}
          profileRoute={ROUTES.EMPLOYEE.PROFILE}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
