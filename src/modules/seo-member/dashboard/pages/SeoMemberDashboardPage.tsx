import { CheckCircle, Eye, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }    from '@/app/providers/LanguageProvider';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { ROUTES }     from '@/app/router/routes';
import { DashboardStatCard }  from '@/shared/components/ui/DashboardStatCard';
import { TodayTasksList }     from '@/modules/employee/dashboard/components/TodayTasksList';
import { useSeoMemberDashboard } from '../hooks/useSeoMemberDashboard';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

export function SeoMemberDashboardPage() {
  const { lang }          = useLang();
  const isAr              = lang === 'ar';
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const { stats, todayTasks, isLoading } = useSeoMemberDashboard();

  if (isLoading) return <DashboardSkeleton />;

  const greeting = isAr
    ? `مرحباً، ${user?.fullName ?? ''} 👋`
    : `Welcome, ${user?.fullName ?? ''} 👋`;

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {greeting}
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={<CheckCircle size={20} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats.completed}
          labelAr="مكتمل"
          labelEn="Completed"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
        />
        <DashboardStatCard
          icon={<Eye size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={stats.needsReview}
          labelAr="بحاجة للمراجعة"
          labelEn="Needs Review"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
        />
        <DashboardStatCard
          icon={<RefreshCw size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={stats.inProgress}
          labelAr="قيد التنفيذ"
          labelEn="In Progress"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
        />
        <DashboardStatCard
          icon={<Clock size={20} className="text-gray-500" />}
          iconBg="bg-gray-100 dark:bg-gray-700"
          value={stats.pending}
          labelAr="قيد الانتظار"
          labelEn="Pending"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {isAr ? 'مهام اليوم' : "Today's Tasks"}
        </h2>
        <TodayTasksList
          tasks={todayTasks}
          isAr={isAr}
          onTaskDetails={(id) => navigate(ROUTES.SEO_MEMBER.TASKS + `/${id}`)}
        />
      </div>

    </div>
  );
}
