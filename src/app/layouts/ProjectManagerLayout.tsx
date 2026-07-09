import { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { AppSidebar } from './components/AppSidebar';
import { Topbar }     from './components/Topbar';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { MyPermissionsWidget } from '@/shared/components/auth';
import { ROUTES }     from '@/app/router/routes';

export function ProjectManagerLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const isProfilePage = location.pathname === ROUTES.PROJECT_MANAGER.PROFILE;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppSidebar
        variant={user?.role === 'admin' ? 'admin' : 'pm'}
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
        <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} profileRoute={ROUTES.PROJECT_MANAGER.PROFILE} />
        <main className="flex-1 p-4 md:p-6">
          {!isProfilePage && (
            <div className="mb-5">
              <MyPermissionsWidget
                profileRoute={ROUTES.PROJECT_MANAGER.PROFILE}
                panelGroup="pm-dashboard"
              />
            </div>
          )}
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
