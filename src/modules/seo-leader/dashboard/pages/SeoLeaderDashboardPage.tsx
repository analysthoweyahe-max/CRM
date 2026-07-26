import { useRef, useState } from 'react';
import { ClipboardList, FolderKanban, Users, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { StatCard }    from '@/shared/components/ui/StatCard';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { usePermission } from '@/shared/hooks/usePermission';
import { TaskStatDropdownCard } from '@/shared/modules/task-briefs/components/TaskStatDropdownCard';
import { TasksSection } from '@/shared/modules/task-briefs/components/TasksSection';
import { useSeoLeaderDashboard }      from '../hooks/useSeoLeaderDashboard';
import { CampaignsSection }           from '../components/CampaignsSection';
import { SeoLeaderDashboardSkeleton } from '../components/SeoLeaderDashboardSkeleton';
import { useSeoTaskStats } from '../../tasks/hooks/useSeoTaskStats';
import { useSeoTaskBriefs } from '../../tasks/hooks/useSeoTaskBriefs';

export function SeoLeaderDashboardPage() {
  const { lang }                        = useLang();
  const isAr                            = lang === 'ar';
  const navigate                        = useNavigate();
  const { isLoading, stats, campaigns, checkIn } = useSeoLeaderDashboard();
  const canCreate   = usePermission('create-seo-project');
  const canViewTasks = usePermission('view-seo-tasks');

  const [activeTaskStatus, setActiveTaskStatus]   = useState('');
  const [activeTaskProject, setActiveTaskProject] = useState('');
  const [taskPage, setTaskPage] = useState(1);
  const tasksSectionRef = useRef<HTMLDivElement>(null);

  const taskStats  = useSeoTaskStats({ enabled: canViewTasks });
  const taskBriefs = useSeoTaskBriefs(activeTaskStatus, activeTaskProject, taskPage, { enabled: canViewTasks });

  if (isLoading) return <SeoLeaderDashboardSkeleton />;

  function focusTasks(statusKey: string) {
    setActiveTaskStatus(statusKey);
    setActiveTaskProject('');
    setTaskPage(1);
    tasksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-6">

      <WorkTimerCard layoutScope="seo" variant="card" initialData={checkIn} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={22} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={stats?.daily_reports ?? 0}
          labelAr="التقارير اليومية"
          labelEn="Daily Reports"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_LEADER.REPORTS)}
        />
        <StatCard
          icon={<Users size={22} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={stats?.active_employees ?? 0}
          labelAr="الموظفين النشطين"
          labelEn="Active Employees"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_LEADER.TEAM)}
        />
        <StatCard
          icon={<ListChecks size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={stats?.pending_tasks ?? 0}
          labelAr="المهام قيد التنفيذ"
          labelEn="Active Tasks"
          isAr={isAr}
          onClick={() => focusTasks('in_progress')}
        />
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats?.total_projects ?? 0}
          labelAr="إجمالي المشاريع"
          labelEn="Total Projects"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_LEADER.MY_PROJECTS)}
        />
        {canViewTasks && (
          <TaskStatDropdownCard
            icon={<ListChecks size={22} className="text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            titleAr="مهام SEO"
            titleEn="SEO Tasks"
            total={taskStats.total}
            byStatus={taskStats.byStatus}
            isAr={isAr}
            isLoading={taskStats.isLoading}
            onSelect={focusTasks}
          />
        )}
        {/* Hidden per request — keep definition for easy re-enable.
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          value={stats?.completed_projects ?? 0}
          labelAr="المشاريع المكتملة"
          labelEn="Completed Projects"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_LEADER.MY_PROJECTS)}
        />
        */}
      </div>

      {/* Campaigns list */}
      <CampaignsSection
        campaigns={campaigns}
        isAr={isAr}
        canCreate={canCreate}
        onNewCampaign={() => navigate(ROUTES.SEO_LEADER.NEW)}
      />

      {/* Tasks list */}
      {canViewTasks && (
        <TasksSection
          ref={tasksSectionRef}
          titleAr="مهام SEO"
          titleEn="SEO Tasks"
          statusOptions={taskStats.byStatus}
          activeStatus={activeTaskStatus}
          onActiveStatusChange={(key) => { setActiveTaskStatus(key); setTaskPage(1); }}
          activeProject={activeTaskProject}
          onActiveProjectChange={(id) => { setActiveTaskProject(id); setTaskPage(1); }}
          tasks={taskBriefs.tasks}
          isLoading={taskBriefs.isLoading}
          isAr={isAr}
          pagination={{
            page: taskBriefs.page,
            lastPage: taskBriefs.lastPage,
            total: taskBriefs.total,
            perPage: taskBriefs.perPage,
            onPageChange: setTaskPage,
          }}
        />
      )}

    </div>
  );
}
