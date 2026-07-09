import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, RefreshCw, Clock, CalendarCheck } from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { ROUTES }      from '@/app/router/routes';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { DashboardStatCard }     from '@/shared/components/ui/DashboardStatCard';
import { useSeoMemberDashboard } from '../hooks/useSeoMemberDashboard';
import { useTodayTasks }         from '../hooks/useTodayTasks';
import { TodayTaskCard }         from '../components/TodayTaskCard';

// ─── Skeleton ────────────────────────────────────────────────────────────────

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
          <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function SeoMemberDashboardPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { tasksOverview, isLoading, checkIn } = useSeoMemberDashboard();
  const { tasks: todayTasks, isLoading: tasksLoading } = useTodayTasks();

  if (isLoading) return <DashboardSkeleton />;

  const greeting = isAr
    ? `مرحباً، ${user?.fullName ?? ''} 👋`
    : `Welcome, ${user?.fullName ?? ''} 👋`;

  const pending = Math.max(0, tasksOverview.totalAssigned - tasksOverview.completed - tasksOverview.inProgress);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{greeting}</h1>

      <WorkTimerCard layoutScope="seo" variant="card" initialData={checkIn} />

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={<CheckCircle size={20} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={tasksOverview.completed}
          labelAr="مكتمل"
          labelEn="Completed"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<Eye size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={0}
          labelAr="بحاجة للمراجعة"
          labelEn="Needs Review"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<RefreshCw size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={tasksOverview.inProgress}
          labelAr="قيد التنفيذ"
          labelEn="In Progress"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<Clock size={20} className="text-gray-500" />}
          iconBg="bg-gray-100 dark:bg-gray-700"
          value={pending}
          labelAr="قيد الانتظار"
          labelEn="Pending"
          isAr={isAr}
        />
      </div>

      {/* Today's tasks */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {isAr ? 'مهام اليوم' : "Today's Tasks"}
        </h2>

        {tasksLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 dark:text-gray-500">
            <CalendarCheck size={28} className="opacity-50" />
            <p className="text-sm">{isAr ? 'لا توجد مهام اليوم' : 'No tasks today'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <TodayTaskCard
                key={task.id}
                task={task}
                isAr={isAr}
                onDetails={task => {
                  const projectId = task.project?.id;
                  if (!projectId) return;
                  navigate(ROUTES.SEO_MEMBER.TASK_DETAIL(projectId, task.uuid));
                }}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
