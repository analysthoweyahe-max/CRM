import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { AdminStatCards }            from '../components/AdminStatCards';
import { RoleDistributionCard }      from '../components/RoleDistributionCard';
import { DepartmentDistributionCard } from '../components/DepartmentDistributionCard';
import { RecentActivityCard }        from '../components/RecentActivityCard';
import { useAdminDashboard }         from '../hooks/useAdminDashboard';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';

  const { stats, roleDistribution, departmentDistribution, activity } = useAdminDashboard();

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

      <AdminStatCards stats={stats} isAr={isAr} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RoleDistributionCard roles={roleDistribution} isAr={isAr} />
        <DepartmentDistributionCard departments={departmentDistribution} isAr={isAr} />
      </div>

      <RecentActivityCard activity={activity} isAr={isAr} />

    </div>
  );
}
