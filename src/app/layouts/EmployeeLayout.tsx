import { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet }   from 'react-router-dom';
import { toast }    from 'sonner';
import { AppSidebar }          from './components/AppSidebar';
import { Topbar }              from './components/Topbar';
import { LoadingSpinner }      from '@/shared/components/feedback/LoadingSpinner';
import { FloatingTimer }       from './components/FloatingTimer';
import { TaskTimerProvider }   from './components/TaskTimerContext';
import { useAttendanceWidget } from './components/useAttendanceWidget';
import { useLang }             from '@/app/providers/LanguageProvider';
import { ROUTES }              from '@/app/router/routes';

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const attendance    = useAttendanceWidget('employee');
  const prevCollapsed = useRef(collapsed);

  useEffect(() => {
    if (prevCollapsed.current && !collapsed && attendance.isActiveDay) {
      toast.success(isAr ? 'جلسة العمل نشطة' : 'Work session active');
    }
    prevCollapsed.current = collapsed;
  }, [collapsed, attendance.isActiveDay, isAr]);

  return (
    <TaskTimerProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AppSidebar
          variant="employee"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(p => !p)}
          isCheckedIn={attendance.isActiveDay}
        />

        <div className={[
          'flex flex-col min-h-screen dark:bg-gray-950',
          'transition-all duration-300',
          collapsed ? 'lg:ms-16' : 'lg:ms-64',
        ].join(' ')}>
          <Topbar
            onMenuToggle={() => setSidebarOpen(p => !p)}
            profileRoute={ROUTES.EMPLOYEE.PROFILE}
            layoutScope="employee"
          />
          <main className="flex-1 p-4 md:p-6">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

        <FloatingTimer />
      </div>
    </TaskTimerProvider>
  );
}
