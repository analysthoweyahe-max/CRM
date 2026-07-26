import { useState, useRef } from 'react';
import { ClipboardList, Users, ListChecks, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { StatCard }        from '@/shared/components/ui/StatCard';
import { usePermission } from '@/shared/hooks/usePermission';
import { TaskStatDropdownCard } from '@/shared/modules/task-briefs/components/TaskStatDropdownCard';
import { TasksSection } from '@/shared/modules/task-briefs/components/TasksSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { ProjectDashboardSkeleton } from '../components/ProjectDashboardSkeleton';
import { usePmDashboard } from '../hooks/usePmDashboard';
import { usePmTeamCount } from '../../team/hooks/usePmTeamCount';
import { usePmTaskStats } from '../../tasks/hooks/usePmTaskStats';
import { usePmTaskBriefs } from '../../tasks/hooks/usePmTaskBriefs';

export function ProjectDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { isLoading, sections, stats, checkIn } = usePmDashboard();
  const teamCount = usePmTeamCount();
  const canCreate = usePermission('create-pm-project');
  const canViewTasks = usePermission('view-pm-tasks');

  const [activeSectionKey, setActiveSectionKey] = useState<string | undefined>(undefined);
  const projectsRef = useRef<HTMLDivElement>(null);

  const [activeTaskStatus, setActiveTaskStatus]   = useState('');
  const [activeTaskProject, setActiveTaskProject] = useState('');
  const [taskPage, setTaskPage] = useState(1);
  const tasksSectionRef = useRef<HTMLDivElement>(null);

  const taskStats  = usePmTaskStats({ enabled: canViewTasks });
  const taskBriefs = usePmTaskBriefs(activeTaskStatus, activeTaskProject, taskPage, { enabled: canViewTasks });

  if (isLoading) return <ProjectDashboardSkeleton />;

  function focusInProgress() {
    setActiveSectionKey('in_progress');
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function focusTasks(statusKey: string) {
    setActiveTaskStatus(statusKey);
    setActiveTaskProject('');
    setTaskPage(1);
    tasksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-6">

      <WorkTimerCard layoutScope="pm" variant="card" initialData={checkIn} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={22} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={stats.dailyReports}
          labelAr="التقارير اليومية"
          labelEn="Daily Reports"
          isAr={isAr}
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.REPORTS)}
        />
        <StatCard
          icon={<Users size={22} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={teamCount}
          labelAr="أعضاء الفريق"
          labelEn="Team Members"
          isAr={isAr}
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.TEAM)}
        />
        <StatCard
          icon={<ListChecks size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={stats.activeTasks}
          labelAr="المهام قيد التنفيذ"
          labelEn="Active Tasks"
          isAr={isAr}
          onClick={focusInProgress}
        />
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats.activeProjects}
          labelAr="المشاريع النشطة"
          labelEn="Active Projects"
          isAr={isAr}
          onClick={focusInProgress}
        />
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats.totalProjects}
          labelAr="إجمالي المشاريع"
          labelEn="Total Projects"
          isAr={isAr}
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.MY_PROJECTS)}
        />
        {canViewTasks && (
          <TaskStatDropdownCard
            icon={<ListChecks size={22} className="text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            titleAr="مهام PM"
            titleEn="PM Tasks"
            total={taskStats.total}
            byStatus={taskStats.byStatus}
            isAr={isAr}
            isLoading={taskStats.isLoading}
            onSelect={focusTasks}
          />
        )}
      </div>

      {/* Projects list */}
      <div ref={projectsRef}>
        <ProjectsSection
          sections={sections}
          activeKey={activeSectionKey ?? sections[0]?.key}
          onActiveKeyChange={setActiveSectionKey}
          isAr={isAr}
          canCreate={canCreate}
          onNewProject={() => navigate(ROUTES.PROJECT_MANAGER.NEW)}
        />
      </div>

      {/* Tasks list */}
      {canViewTasks && (
        <TasksSection
          ref={tasksSectionRef}
          titleAr="مهام PM"
          titleEn="PM Tasks"
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
