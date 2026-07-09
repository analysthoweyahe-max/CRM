import { useState, Suspense } from 'react';
import { Outlet }   from 'react-router-dom';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { AppSidebar } from './components/AppSidebar';
import { Topbar }     from './components/Topbar';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

export function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppSidebar
        variant={user?.role === 'admin' ? 'admin' : 'hr'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(p => !p)}
      />

      <div className={[
        'flex flex-col min-h-screen dark:bg-gray-950',
        'transition-all duration-300',
        collapsed ? 'lg:ms-16' : 'lg:ms-64',
      ].join(' ')}>
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 p-4 md:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
