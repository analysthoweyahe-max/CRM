import { useState, Suspense, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { useLang }    from '@/app/providers/LanguageProvider';
import { AppSidebar } from './components/AppSidebar';
import { Topbar }     from './components/Topbar';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { useAttendanceWidget } from './components/useAttendanceWidget';
import { ROUTES }     from '@/app/router/routes';
import { FloatingTimer }      from '@/shared/modules/task-timer/components/FloatingTimer';
import { TaskTimersProvider } from '@/shared/modules/task-timer/hooks/useTaskTimers';

export function ProjectManagerLayout() {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  const attendance = useAttendanceWidget('pm');
  const prevCollapsed = useRef(collapsed);

  useEffect(() => {
    if (isSuperAdmin) return;
    if (prevCollapsed.current && !collapsed && attendance.isActiveDay) {
      toast.success(isAr ? 'جلسة العمل نشطة' : 'Work session active');
    }
    prevCollapsed.current = collapsed;
  }, [collapsed, attendance.isActiveDay, isAr, isSuperAdmin]);

  return (
    <TaskTimersProvider attendanceScope="pm">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AppSidebar
          variant={user?.role === 'admin' ? 'admin' : 'pm'}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(p => !p)}
          isCheckedIn={!isSuperAdmin && attendance.isActiveDay}
        />

        <div className={[
          'flex flex-col min-h-screen dark:bg-gray-950',
          'transition-all duration-300',
          collapsed ? 'lg:ms-16' : 'lg:ms-64',
        ].join(' ')}>
          <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} profileRoute={ROUTES.PROJECT_MANAGER.PROFILE} layoutScope="pm" />
          <main className="flex-1 p-4 md:p-6">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

        <FloatingTimer />
      </div>
    </TaskTimersProvider>
  );
}
