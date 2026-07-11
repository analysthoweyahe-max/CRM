import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Plus, Info, FolderOpen } from 'lucide-react';import { GithubIcon } from '@/shared/components/icons/GithubIcon';
import { ensureHttpUrl } from '@/shared/utils';
import { toast } from 'sonner';
import { useLang }         from '@/app/providers/LanguageProvider';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { Combobox }        from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ROUTES }          from '@/app/router/routes';
import { extractApiError } from '@/shared/utils/error.utils';
import { useProjectDetails }   from '../hooks/useProjectDetails';
import { usePmProjectLookups } from '../hooks/usePmProjectLookups';
import { pmProjectsApi } from '../api/project.api';
import { useProjectTasks } from '../../tasks/store/taskStore';
import { KanbanBoard }     from '../components/KanbanBoard';
import { ProgressLogTab }     from '../components/ProgressLogTab';import { ProjectSettingsTab } from '../components/ProjectSettingsTab';
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
  const [searchParams] = useSearchParams();
  const queryClient    = useQueryClient();

  const { project, isLoading, isError, refetch } = useProjectDetails(id);
  const { statuses }                              = usePmProjectLookups();
  const projectKey = project
    ? (project.uuid || String(project.id))
    : (id ?? '');
  const tasks = useProjectTasks(projectKey);

  const tabParam = searchParams.get('tab');
  const initialTab: TabKey =
    tabParam === 'messages' ? 'messages'
    : tabParam === 'settings' ? 'settings'
    : tabParam === 'team' ? 'team'
    : tabParam === 'client' ? 'client'
    : tabParam === 'progress' ? 'progress'
    : 'tasks';
  const [activeTab,      setActiveTab]      = useState<TabKey>(initialTab);

  useEffect(() => {
    if (tabParam === 'messages') setActiveTab('messages');
    else if (tabParam === 'settings') setActiveTab('settings');
    else if (tabParam === 'team') setActiveTab('team');
    else if (tabParam === 'client') setActiveTab('client');
    else if (tabParam === 'progress') setActiveTab('progress');
  }, [tabParam]);
  const [changingStatus, setChangingStatus] = useState(false);
  const [publishing, setPublishing]         = useState(false);
  if (isLoading) return <ProjectDetailsSkeleton />;

  if (isError || !project) {
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
    return null;
  }

  async function handleStatusChange(status: string) {
    if (status === project!.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await pmProjectsApi.updateStatus(projectKey, status);
      toast.success(isAr ? 'تم تحديث حالة المشروع' : 'Project status updated');
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['pm-project-settings', projectKey] });
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المشروع' : 'Failed to update status'));
    } finally {
      setChangingStatus(false);
    }
  }

  async function handlePublish() {
    if (!project!.isDraft || publishing) return;
    setPublishing(true);
    try {
      await pmProjectsApi.updateSettings(projectKey, {
        name:    project!.name,
        isDraft: false,
      });
      toast.success(isAr ? 'تم نشر المشروع' : 'Project published');
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['pm-project-settings', projectKey] });
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر نشر المشروع' : 'Failed to publish project'));
    } finally {
      setPublishing(false);
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
            onClick={() => navigate(ROUTES.PROJECT_MANAGER.INFO(String(project.id)))}            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600
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
              aria-label={isAr ? 'رابط GitHub' : 'GitHub Link'}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200
                         dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-white transition-colors
                         hover:bg-[#24292f] hover:border-[#24292f]"
            >
              <GithubIcon size={18} />
            </a>
          )}
          {project.driveLink && (
            <a
              href={ensureHttpUrl(project.driveLink)}
              target="_blank"
              rel="noopener noreferrer"
              title={isAr ? 'فتح Google Drive' : 'Open Google Drive'}
              aria-label={isAr ? 'رابط Google Drive' : 'Google Drive Link'}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200
                         dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-white transition-colors
                         hover:bg-[#A0CD39] hover:border-[#A0CD39]"
            >
              <FolderOpen size={18} />
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
            <>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {isAr ? 'مسودة' : 'Draft'}
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={publishing}
                onClick={handlePublish}
              >
                {publishing
                  ? (isAr ? 'جاري النشر...' : 'Publishing…')
                  : (isAr ? 'نشر المشروع' : 'Publish')}
              </Button>
            </>
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
      {activeTab === 'tasks'    && (
        <KanbanBoard
          projectId={projectKey}
          tasks={tasks}
          isAr={isAr}
          phases={project.phases}
          teamMembers={project.teamMembers}
        />
      )}
      {activeTab === 'client'   && <ProjectClientUpdatesTab projectId={projectKey} isAr={isAr} />}
      {activeTab === 'team'     && <ProjectTeamTab projectId={projectKey} isAr={isAr} />}
      {activeTab === 'progress' && <ProgressLogTab tasks={tasks} isAr={isAr} />}
      {activeTab === 'settings' && (
        <ProjectSettingsTab project={project} isAr={isAr} onPublished={refetch} />
      )}
      {activeTab === 'messages' && <ProjectMessagesTab projectId={projectKey} isAr={isAr} />}
    </div>  );
}
