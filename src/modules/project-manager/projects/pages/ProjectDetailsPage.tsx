import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }         from '@/app/providers/LanguageProvider';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { Combobox }        from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ROUTES }          from '@/app/router/routes';
import { getAvatarColor }  from '@/shared/utils';
import { useProjectDetails }   from '../hooks/useProjectDetails';
import { usePmProjectLookups } from '../hooks/usePmProjectLookups';
import { pmProjectsApi }   from '../api/project.api';
import { useProjectTasks } from '../../tasks/store/taskStore';
import { KanbanBoard }     from '../components/KanbanBoard';
import { AddTaskModal }    from '../components/AddTaskModal';
import { ProgressLogTab }     from '../components/ProgressLogTab';
import { ProjectSettingsTab } from '../components/ProjectSettingsTab';
import { ProjectTeamTab }     from '../components/ProjectTeamTab';
import { ProjectMessagesTab } from '../components/ProjectMessagesTab';
import { ProjectDetailsSkeleton } from '../components/ProjectDetailsSkeleton';
import type { TeamMember, PmProjectTeamMember } from '../types/project.types';

type TabKey = 'tasks' | 'messages' | 'team' | 'progress' | 'settings';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',          en: 'Tasks'        },
  { key: 'messages', ar: 'رسائل المشروع',   en: 'Messages'     },
  { key: 'team',     ar: 'فريق العمل',      en: 'Team'         },
  { key: 'progress', ar: 'سجل الإنجاز',     en: 'Progress Log' },
  { key: 'settings', ar: 'إعدادات المشروع', en: 'Settings'     },
];

function toLegacyTeamMember(m: PmProjectTeamMember): TeamMember {
  return {
    initial:  m.avatarInitial,
    color:    getAvatarColor(m.id),
    name:     m.name,
    role:     m.projectRole || m.jobTitle,
    email:    m.email,
    isActive: m.status === 'active',
  };
}

export function ProjectDetailsPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();

  const { project, isLoading, isError, refetch } = useProjectDetails(id);
  const { statuses }                              = usePmProjectLookups();
  const tasks = useProjectTasks(id ?? '');

  const [activeTab,      setActiveTab]      = useState<TabKey>('tasks');
  const [showAddTask,    setShowAddTask]    = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  if (isLoading) return <ProjectDetailsSkeleton />;

  if (isError || !project) {
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
    return null;
  }

  async function handleStatusChange(status: string) {
    if (status === project!.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await pmProjectsApi.updateStatus(project!.id, status);
      toast.success(isAr ? 'تم تحديث حالة المشروع' : 'Project status updated');
      refetch();
    } catch {
      toast.error(isAr ? 'تعذر تحديث حالة المشروع' : 'Failed to update status');
    } finally {
      setChangingStatus(false);
    }
  }

  const statusItems: ComboboxItem[] = statuses.map(s => ({ id: s.value, label: s.label }));
  const legacyTeam = project.teamMembers.map(toLegacyTeamMember);

  // No progress/task-count fields on the project API yet — computed from the local Kanban tasks for now.
  const tasksTotal     = tasks.length;
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const progress       = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className="space-y-5">

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.PROJECT_MANAGER.DASHBOARD)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                   hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
      >
        <ArrowLeft size={15} />
        {isAr ? 'العودة' : 'Back'}
      </button>

      {/* Project header */}
      <Card className="p-5 space-y-3">
        {/* Name + badges */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {project.name}
          </h1>
          <div className="w-40">
            <Combobox
              items={statusItems}
              value={project.status}
              onChange={handleStatusChange}
              disabled={changingStatus}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600
                           text-gray-500 dark:text-gray-400">
            {project.projectTypeLabel}
          </span>
          {project.isDraft && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              {isAr ? 'مسودة' : 'Draft'}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{progress}%</span>
            <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-end">
          {isAr ? 'المهام:' : 'Tasks:'}
          <span className="ms-1.5 font-semibold text-gray-800 dark:text-gray-100">
            {tasksCompleted}/{tasksTotal}
          </span>
        </p>

        {/* Dates */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-end">
          {isAr ? 'من' : 'From'}
          <span className="mx-1.5 font-semibold text-gray-800 dark:text-gray-100">{project.startDate}</span>
          {isAr ? 'إلى' : 'to'}
          <span className="ms-1.5 font-semibold text-gray-800 dark:text-gray-100">{project.deadline}</span>
        </p>
      </Card>

      {/* Tabs bar + Add Task button */}
      <div className="flex items-end justify-between gap-4
                      border-b border-gray-100 dark:border-gray-700/60">
        {/* Tabs (start = right in RTL) */}
        <div className="flex items-end gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* Add Task button — only on tasks tab */}
        {activeTab === 'tasks' && (
          <div className="pb-2 shrink-0">
            <Button
              variant="primary"
              startIcon={<Plus size={15} />}
              onClick={() => setShowAddTask(true)}
            >
              {isAr ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          </div>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks'    && <KanbanBoard projectId={String(project.id)} tasks={tasks} isAr={isAr} />}
      {activeTab === 'team'     && <ProjectTeamTab projectId={String(project.id)} isAr={isAr} />}
      {activeTab === 'progress' && <ProgressLogTab tasks={tasks} isAr={isAr} />}
      {activeTab === 'settings' && <ProjectSettingsTab project={project} isAr={isAr} />}
      {activeTab === 'messages' && <ProjectMessagesTab team={legacyTeam} isAr={isAr} />}

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        projectId={String(project.id)}
        team={project.teamMembers}
        phases={project.phases}
        taskCount={tasks.length}
        isAr={isAr}
      />
    </div>
  );
}
