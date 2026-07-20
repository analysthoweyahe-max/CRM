import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { ROUTES }      from '@/app/router/routes';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { DashboardStatCard }     from '@/shared/components/ui/DashboardStatCard';
import { Button } from '@/shared/components/ui/Button';
import { MyProjectCard } from '@/shared/modules/my-projects/components/MyProjectCard';
import { resolveMyProjectsConfig } from '@/shared/modules/my-projects/utils/myProjects.utils';
import { useSeoTaskLookups } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import { useSeoMemberDashboard } from '../hooks/useSeoMemberDashboard';
import { useTodayTasks }         from '../hooks/useTodayTasks';
import { SeoHomeTasksSection }   from '../components/SeoHomeTasksSection';
import { buildSeoTaskStatusStats } from '../utils/seoTaskStatusStats.utils';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700" />
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

export function SeoMemberDashboardPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const { user, can }  = useAuth();
  const navigate  = useNavigate();
  const { projects, isLoading, checkIn } = useSeoMemberDashboard();
  const { tasks: todayTasks, isLoading: tasksLoading } = useTodayTasks();
  const { statusOptions } = useSeoTaskLookups(isAr);
  const projectsConfig = {
    ...resolveMyProjectsConfig(user?.role ?? 'seo-member', 'seo'),
    canCreate: can('create-seo-project'),
  };
  const canCreate = projectsConfig.canCreate;

  const [activeStatus, setActiveStatus] = useState('');
  const tasksSectionRef = useRef<HTMLDivElement>(null);

  const statCards = useMemo(
    () => buildSeoTaskStatusStats(todayTasks, statusOptions),
    [todayTasks, statusOptions],
  );

  function handleStatClick(statusKey: string) {
    setActiveStatus(prev => (prev === statusKey ? '' : statusKey));
    setTimeout(() => {
      tasksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  if (isLoading) return <DashboardSkeleton />;

  const greeting = isAr
    ? `مرحباً، ${user?.fullName ?? ''}`
    : `Welcome, ${user?.fullName ?? ''}`;

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{greeting}</h1>
        {canCreate && (
          <Button
            variant="primary"
            startIcon={<Plus size={15} />}
            onClick={() => navigate(ROUTES.SEO_MEMBER.NEW)}
          >
            {isAr ? 'إنشاء مشروع' : 'Create Project'}
          </Button>
        )}
      </div>

      <WorkTimerCard layoutScope="seo" variant="card" initialData={checkIn} />

      {statCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <DashboardStatCard
              key={card.key}
              square
              icon={(
                <span
                  className="block w-3 h-3 rounded-full"
                  style={{ backgroundColor: card.color ?? '#9CA3AF' }}
                />
              )}
              iconBg="bg-gray-100 dark:bg-gray-700"
              value={card.count}
              label={card.label}
              isAr={isAr}
              isActive={activeStatus === card.key}
              onClick={() => handleStatClick(card.key)}
            />
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {isAr ? `مشاريعي (${projects.length})` : `My Projects (${projects.length})`}
          </h2>
          <Button variant="ghost" onClick={() => navigate(ROUTES.SEO_MEMBER.MY_PROJECTS)}>
            {isAr ? 'عرض الكل' : 'View all'}
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400 dark:text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <FolderKanban size={28} className="opacity-50" />
            <p className="text-sm">{isAr ? 'لا توجد مشاريع معيّنة لك حالياً' : 'No projects assigned to you yet'}</p>
            {canCreate && (
              <Button
                variant="primary"
                startIcon={<Plus size={15} />}
                onClick={() => navigate(ROUTES.SEO_MEMBER.NEW)}
              >
                {isAr ? 'إنشاء مشروع' : 'Create Project'}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <MyProjectCard
                key={String(project.id)}
                item={{ kind: 'seo', project }}
                config={projectsConfig}
                isAr={isAr}
              />
            ))}
          </div>
        )}
      </div>

      <div ref={tasksSectionRef}>
        <SeoHomeTasksSection
          tasks={todayTasks}
          isLoading={tasksLoading}
          isAr={isAr}
          externalStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />
      </div>

    </div>
  );
}
