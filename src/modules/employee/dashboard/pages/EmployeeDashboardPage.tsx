import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { EmpStatCards }      from '../components/EmpStatCards';
import { MyProjectsSection } from '../components/MyProjectsSection';
import { useEmpDashboard }   from '../hooks/useEmpDashboard';

export function EmployeeDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const { user } = useAuth();

  const { isLoading, overview, pending, sections } = useEmpDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isAr ? `مرحباً، ${user?.fullName ?? ''} 👋` : `Welcome, ${user?.fullName ?? ''} 👋`}
      </h1>

      <EmpStatCards overview={overview} pending={pending} isAr={isAr} />

      <MyProjectsSection sections={sections} isAr={isAr} />

    </div>
  );
}
