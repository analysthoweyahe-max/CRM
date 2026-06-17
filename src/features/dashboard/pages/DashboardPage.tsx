import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { StatCards }    from '@/features/dashboard/components/StatCards';
import { ChartsSection } from '@/features/dashboard/components/ChartsSection';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { RecentData }   from '@/features/dashboard/components/RecentData';

export function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''}`
            : `Welcome back, ${user?.fullName ?? ''}`}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {isAr
            ? 'نظرة عامة على أداء الموارد البشرية اليوم'
            : "Overview of today's HR performance"}
        </p>
      </div>

      <StatCards    isAr={isAr} />
      <ChartsSection isAr={isAr} />
      <QuickActions isAr={isAr} />
      <RecentData   isAr={isAr} />

    </div>
  );
}
