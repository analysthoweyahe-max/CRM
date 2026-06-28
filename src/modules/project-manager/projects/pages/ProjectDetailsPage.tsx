import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useLang }         from '@/app/providers/LanguageProvider';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { ROUTES }          from '@/app/router/routes';
import { useProjects }     from '../store/projectStore';
import { useProjectTasks } from '../../tasks/store/taskStore';
import { KanbanBoard }     from '../components/KanbanBoard';
import { AddTaskModal }    from '../components/AddTaskModal';
import { ProgressLogTab }     from '../components/ProgressLogTab';
import { ProjectSettingsTab }  from '../components/ProjectSettingsTab';
import { ProjectTeamTab }      from '../components/ProjectTeamTab';
import { ProjectMessagesTab }  from '../components/ProjectMessagesTab';
import { ProjectDetailsSkeleton } from '../components/ProjectDetailsSkeleton';

const STATUS_BADGE: Record<string, string> = {
  inProgress: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]',
  completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  notStarted: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress' },
  completed:  { ar: 'مكتمل',       en: 'Completed'   },
  paused:     { ar: 'متوقف',       en: 'Paused'      },
  notStarted: { ar: 'لم يبدأ',     en: 'Not Started' },
};

type TabKey = 'tasks' | 'messages' | 'team' | 'progress' | 'settings';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',          en: 'Tasks'        },
  { key: 'messages', ar: 'رسائل المشروع',   en: 'Messages'     },
  { key: 'team',     ar: 'فريق العمل',      en: 'Team'         },
  { key: 'progress', ar: 'سجل الإنجاز',     en: 'Progress Log' },
  { key: 'settings', ar: 'إعدادات المشروع', en: 'Settings'     },
];

export function ProjectDetailsPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();

  const projects  = useProjects();
  const project   = projects.find(p => p.id === id);
  const tasks     = useProjectTasks(id ?? '');

  const [activeTab,   setActiveTab]   = useState<TabKey>('tasks');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, [id]);

  if (isLoading) return <ProjectDetailsSkeleton />;

  if (!project) {
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
    return null;
  }

  const statusLabel = STATUS_LABEL[project.status] ?? { ar: '', en: '' };

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
            {isAr ? project.nameAr : project.nameEn}
          </h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[project.status]}`}>
            {isAr ? statusLabel.ar : statusLabel.en}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600
                           text-gray-500 dark:text-gray-400">
            {isAr ? project.categoryAr : project.categoryEn}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{project.progress}%</span>
            <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Tasks count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-end">
          {isAr ? 'المهام:' : 'Tasks:'}
          <span className="ms-1.5 font-semibold text-gray-800 dark:text-gray-100">
            {project.tasksCompleted}/{project.tasksTotal}
          </span>
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
      {activeTab === 'tasks'    && <KanbanBoard tasks={tasks} isAr={isAr} />}
      {activeTab === 'team'     && <ProjectTeamTab projectId={project.id} isAr={isAr} />}
      {activeTab === 'progress' && <ProgressLogTab project={project} tasks={tasks} isAr={isAr} />}
      {activeTab === 'settings' && <ProjectSettingsTab project={project} isAr={isAr} />}
      {activeTab === 'messages' && <ProjectMessagesTab team={project.team} isAr={isAr} />}

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        projectId={project.id}
        team={project.team}
        taskCount={tasks.length}
        isAr={isAr}
      />
    </div>
  );
}
