import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useSalesDashboardMock } from '../hooks/useSalesDashboardMock';
import { SalesStatCards }         from '../components/SalesStatCards';
import { SalesChartsSection }     from '../components/SalesChartsSection';
import { SalesPipelineFunnel }    from '../components/SalesPipelineFunnel';
import { SalesEmployeePerformance } from '../components/SalesEmployeePerformance';
import { SalesFollowUpsActivity } from '../components/SalesFollowUpsActivity';

export function SalesDashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    stats,
    revenueTrend,
    leadSources,
    funnelStages,
    employeePerformance,
    upcomingFollowUps,
    recentActivity,
  } = useSalesDashboardMock();

  return (
    <div className="space-y-6">

      <div className="fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''}`
            : `Welcome back, ${user?.fullName ?? ''}`}
        </h2>
      </div>

      <SalesStatCards isAr={isAr} stats={stats} />

      <SalesChartsSection isAr={isAr} revenueTrend={revenueTrend} leadSources={leadSources} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesPipelineFunnel isAr={isAr} stages={funnelStages} />
        <SalesEmployeePerformance isAr={isAr} rows={employeePerformance} />
      </div>

      <SalesFollowUpsActivity isAr={isAr} followUps={upcomingFollowUps} activity={recentActivity} />

    </div>
  );
}
