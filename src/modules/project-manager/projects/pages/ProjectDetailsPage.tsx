import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Info } from 'lucide-react';
import { GithubIcon } from '@/shared/components/icons/GithubIcon';
import { ensureHttpUrl } from '@/shared/utils';
import { toast } from 'sonner';
import { useLang }         from '@/app/providers/LanguageProvider';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { Combobox }        from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ROUTES }          from '@/app/router/routes';
import { useProjectDetails }   from '../hooks/useProjectDetails';
import { usePmProjectLookups } from '../hooks/usePmProjectLookups';
import { pmProjectsApi } from '../api/project.api';
import { useProjectTasks } from '../../tasks/store/taskStore';
import { KanbanBoard }     from '../components/KanbanBoard';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { ProgressLogTab }     from '../components/ProgressLogTab';
import { ProjectSettingsTab } from '../components/ProjectSettingsTab';
import { ProjectTeamTab }     from '../components/ProjectTeamTab';
import { ProjectMessagesTab } from '../components/ProjectMessagesTab';
import { ProjectClientUpdatesTab } from '../components/ProjectClientUpdatesTab';
import { ProjectDetailsSkeleton } from '../components/ProjectDetailsSkeleton';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

type TabKey = 'tasks' | 'client' | 'messages' | 'team' | 'progress' | 'settings';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',          en: 'Tasks'          },
  { key: 'client',   ar: 'تحديثات العميل',  en: 'Client Updates' },
  { key: 'messages', ar: 'رسائل المشروع',   en: 'Messages'       },
  { key: 'team',     ar: 'فريق العمل',      en: 'Team'           },
  { key: 'progress', ar: 'سجل الإنجاز',     en: 'Progress Log'   },
  { key: 'settings', ar: 'إعدادات المشروع', en: 'Settings'       },
];

export function ProjectDetailsPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();

  const { project, isLoading, isError, refetch } = useProjectDetails(id);
  const { statuses }                              = usePmProjectLookups();
  const tasks = useProjectTasks(id ?? '');

  const [activeTab,      setActiveTab]      = useState<TabKey>('tasks');
  const [showDetails,    setShowDetails]    = useState(false);
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

  const statusItems: ComboboxItem[] = statuses.map(s => ({
    id:    s.value,
    label: translateProjectLookup(s.value, s.label, isAr),
  }));

  // No progress/task-count fields on the project API yet — computed from the local Kanban tasks for now.
  const tasksTotal     = tasks.length;
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const progress       = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Details + GitHub link + Back */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
                       hover:border-[#A0CD39] hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
          >
            <Info size={15} />
            {isAr ? 'تفاصيل المشروع' : 'Project Details'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.DASHBOARD)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                     hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
        >
          <BackIcon size={15} />
          {isAr ? 'العودة' : 'Back'}
        </button>
      </div>

      {/* Project header */}
      <Card className="p-5 space-y-3">
        {/* Name + badges */}
        <div className="flex items-center gap-2.5 flex-wrap justify-start">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {project.name}
          </h1>
          {project.githubLink && (
            <a
              href={ensureHttpUrl(project.githubLink)}
              target="_blank"
              rel="noopener noreferrer"
              title={isAr ? 'فتح مستودع GitHub' : 'Open GitHub repository'}
              aria-label="GitHub"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200
                         dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-white
                         hover:bg-[#24292f] hover:border-[#24292f] transition-colors"
            >
              <GithubIcon size={18} />
            </a>
          )}
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
            {translateProjectLookup(project.projectType, project.projectTypeLabel, isAr)}
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
            <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#A0CD39] transition-all duration-500${isAr ? ' ms-auto' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-start">
          {isAr ? 'المهام:' : 'Tasks:'}
          <span className="ms-1.5 font-semibold text-gray-800 dark:text-gray-100">
            {tasksCompleted}/{tasksTotal}
          </span>
        </p>

        {/* Dates */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-start">
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
              onClick={() => navigate(ROUTES.PROJECT_MANAGER.ADD_TASK(String(project.id)))}
            >
              {isAr ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          </div>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks'    && <KanbanBoard projectId={String(project.id)} tasks={tasks} isAr={isAr} />}
      {activeTab === 'client'   && <ProjectClientUpdatesTab projectId={String(project.id)} isAr={isAr} />}
      {activeTab === 'team'     && <ProjectTeamTab projectId={String(project.id)} isAr={isAr} />}
      {activeTab === 'progress' && <ProgressLogTab tasks={tasks} isAr={isAr} />}
      {activeTab === 'settings' && <ProjectSettingsTab project={project} isAr={isAr} />}
      {activeTab === 'messages' && <ProjectMessagesTab projectId={String(project.id)} isAr={isAr} />}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        project={project}
        isAr={isAr}
      />
    </div>
  );
}
