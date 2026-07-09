import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { AdminStatCards }            from '../components/AdminStatCards';
import { RoleDistributionCard }      from '../components/RoleDistributionCard';
import { DepartmentDistributionCard } from '../components/DepartmentDistributionCard';
import { RecentActivityCard }        from '../components/RecentActivityCard';
import { useAdminDashboard }         from '../hooks/useAdminDashboard';
import { MyPermissionsWidget } from '@/shared/components/auth';
import { ROUTES } from '@/app/router/routes';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';

  const { stats, roleDistribution, departmentDistribution, activity, isLoading } = useAdminDashboard();

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'لوحة المشرف العام' : 'General Supervisor Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''} — نظرة عامة على المؤسسة والموظفين`
            : `Welcome back, ${user?.fullName ?? ''} — overview of the organization and staff`}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <>
          <AdminStatCards stats={stats} isAr={isAr} />

          <MyPermissionsWidget profileRoute={ROUTES.PROFILE} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RoleDistributionCard roles={roleDistribution} isAr={isAr} />
            <DepartmentDistributionCard departments={departmentDistribution} isAr={isAr} />
          </div>

          <RecentActivityCard activity={activity} isAr={isAr} />
        </>
      )}

    </div>
  );
}
