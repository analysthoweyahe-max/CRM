import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { StatCards }         from '@/modules/hr/dashboard/components/StatCards';
import { ChartsSection }     from '@/modules/hr/dashboard/components/ChartsSection';
import { QuickActions }      from '@/modules/hr/dashboard/components/QuickActions';
import { RecentData }        from '@/modules/hr/dashboard/components/RecentData';
import { DashboardSkeleton } from '@/modules/hr/dashboard/components/DashboardSkeleton';
import { useDashboard }      from '@/modules/hr/dashboard/hooks/useDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    isLoading,
    stats,
    deptDistribution,
    attendanceSummary,
    recentEmployees,
    recentLeaves,
  } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">

      <div className="fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''}`
            : `Welcome back, ${user?.fullName ?? ''}`}
        </h2>
      </div>

      <StatCards isAr={isAr} stats={stats} />

      <ChartsSection
        isAr={isAr}
        deptDistribution={deptDistribution}
        attendanceSummary={attendanceSummary}
      />

      <QuickActions isAr={isAr} />

      <RecentData
        isAr={isAr}
        recentEmployees={recentEmployees}
        recentLeaves={recentLeaves}
      />

    </div>
  );
}
