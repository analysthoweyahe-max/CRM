import { useState, useEffect, useRef } from 'react';
import { Outlet }   from 'react-router-dom';
import { toast }    from 'sonner';
import { AppSidebar }          from './components/AppSidebar';
import { Topbar }              from './components/Topbar';
import { AttendanceWidget }    from './components/AttendanceWidget';
import { FloatingTimer }       from './components/FloatingTimer';
import { TaskTimerProvider }   from './components/TaskTimerContext';
import { useAttendanceWidget } from './components/useAttendanceWidget';
import { useLang }             from '@/app/providers/LanguageProvider';
import { ROUTES }              from '@/app/router/routes';

export function SeoMemberLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const attendance    = useAttendanceWidget();
  const prevCollapsed = useRef(collapsed);

  useEffect(() => {
    if (prevCollapsed.current && !collapsed && attendance.isCheckedIn) {
      toast.success(isAr ? 'تم تسجيل الحضور' : 'You are checked in');
    }
    prevCollapsed.current = collapsed;
  }, [collapsed]);

  return (
    <TaskTimerProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AppSidebar
          variant="seo-member"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(p => !p)}
          isCheckedIn={attendance.isCheckedIn}
          footerWidget={<AttendanceWidget {...attendance} />}
        />

        <div className={[
          'flex flex-col min-h-screen dark:bg-gray-950',
          'transition-all duration-300',
          collapsed ? 'lg:ms-16' : 'lg:ms-64',
        ].join(' ')}>
          <Topbar
            onMenuToggle={() => setSidebarOpen(p => !p)}
            profileRoute={ROUTES.SEO_MEMBER.PROFILE}
          />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>

        <FloatingTimer />
      </div>
    </TaskTimerProvider>
  );
}
