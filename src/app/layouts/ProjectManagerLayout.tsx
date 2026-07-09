import { useState, Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { useLang }    from '@/app/providers/LanguageProvider';
import { AppSidebar } from './components/AppSidebar';
import { Topbar }     from './components/Topbar';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { MyPermissionsWidget } from '@/shared/components/auth';
import { AttendanceWidget } from './components/AttendanceWidget';
import { useAttendanceWidget } from './components/useAttendanceWidget';
import { ROUTES }     from '@/app/router/routes';

export function ProjectManagerLayout() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const isProfilePage = location.pathname === ROUTES.PROJECT_MANAGER.PROFILE;

  const attendance = useAttendanceWidget('pm');
  const prevCollapsed = useRef(collapsed);

  useEffect(() => {
    if (prevCollapsed.current && !collapsed && attendance.isActiveDay) {
      toast.success(isAr ? 'جلسة العمل نشطة' : 'Work session active');
    }
    prevCollapsed.current = collapsed;
  }, [collapsed, attendance.isActiveDay, isAr]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppSidebar
        variant={user?.role === 'admin' ? 'admin' : 'pm'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(p => !p)}
        isCheckedIn={attendance.isActiveDay}
        footerWidget={<AttendanceWidget layoutScope="pm" />}
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
