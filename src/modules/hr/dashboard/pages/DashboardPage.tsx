import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { StatCards }        from '@/modules/hr/dashboard/components/StatCards';
import { ChartsSection }    from '@/modules/hr/dashboard/components/ChartsSection';
import { QuickActions }     from '@/modules/hr/dashboard/components/QuickActions';
import { RecentData }       from '@/modules/hr/dashboard/components/RecentData';
import { DashboardSkeleton } from '@/modules/hr/dashboard/components/DashboardSkeleton';

export function DashboardPage() {
  const { user }    = useAuth();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const [loading, setLoading] = useState(true);

  // Simulate data fetch — replace with real API call when ready
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''}`
            : `Welcome back, ${user?.fullName ?? ''}`}
        </h2>
      
      </div>

      <StatCards     isAr={isAr} />
      <ChartsSection isAr={isAr} />
      <QuickActions  isAr={isAr} />
      <RecentData    isAr={isAr} />

    </div>
  );
}
