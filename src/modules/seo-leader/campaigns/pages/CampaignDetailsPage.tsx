import { useState, useMemo, useEffect }     from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus }        from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast }                  from 'sonner';
import { useLang }                from '@/app/providers/LanguageProvider';
import { Card }                   from '@/shared/components/ui/Card';
import { Button }                 from '@/shared/components/ui/Button';
import { Combobox }               from '@/shared/components/form/Combobox';
import type { ComboboxItem }      from '@/shared/components/form/Combobox';
import { ROUTES }                 from '@/app/router/routes';
import { extractApiError }        from '@/shared/utils/error.utils';
import { campaignApi }                       from '../api/campaign.api';
import type { SeoTask }                      from '../api/campaign.api';
import { SeoTaskDrawer }          from '../components/SeoTaskDrawer';
import { ProjectMessages }        from '../components/ProjectMessages';
import { SeoProjectTeamTab }      from '../../projects/components/SeoProjectTeamTab';
import { SeoProjectSettingsTab }  from '../components/SeoProjectSettingsTab';
import { SeoProgressTab }         from '../components/SeoProgressTab';
import { SeoClientUpdatesTab }    from '../components/SeoClientUpdatesTab';
import { SeoStatusColumn }        from '../components/SeoStatusColumn';
import { useSeoTaskStatusList }   from '@/modules/admin/seo-task-statuses/hooks/useSeoTaskStatuses';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import type { Task, TaskStatus }  from '@/modules/project-manager/tasks/types/task.types';

/* Task.status is typed as the PM's fixed 4-value union, but the real set of
   SEO task statuses is whatever's configured in "SEO Task Statuses" (admin
   module) — including custom keys like "blocked" or "custom_status" that
   don't fit that union. We keep the real backend key on `rawStatus` (used
   for the Kanban columns + the status-update API call) and only use this
   coarse mapping for the other tabs (SeoProgressTab) that still expect the
   narrow union for their stats. */
function coarseStatus(rawKey: string, marksCompleted: boolean): TaskStatus {
  if (marksCompleted) return 'completed';
  if (rawKey === 'in_progress') return 'in_progress';
  if (rawKey === 'in_review' || rawKey === 'review') return 'needs_review';
  return 'pending';
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-sky-500', 'bg-amber-500',
  'bg-rose-500',   'bg-teal-500', 'bg-indigo-500',
];

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const PRIORITY_MAP: Record<string, Task['priority']> = {
  urgent: 'urgent',
  high:   'high',
  normal: 'normal',
  medium: 'normal',
  low:    'low',
};

export interface SeoTaskVM extends Task {
  /** The real backend status key (e.g. "blocked", "custom_status") — the
   *  Kanban board groups/drags by this, not by the coarse `status` union. */
  rawStatus: string;
}

function toLocalTask(t: SeoTask, projectId: string, marksCompletedByKey: Record<string, boolean>): SeoTaskVM {
  const assignee = t.assignees?.[0]?.name ?? '';
  return {
    id:              String(t.id),
    projectId,
    title:           t.title,
    description:     t.description ?? '',
    phaseName:       t.phase ?? t.taskTypeLabel ?? 'مهمة SEO',
    priority:        PRIORITY_MAP[t.priority] ?? 'normal',
    assigneeName:    assignee,
    assigneeInitial: assignee ? assignee[0].toUpperCase() : '?',
    assigneeColor:   avatarColor(assignee),
    dueDate:         t.dueDate ?? '',
    estimatedHours:  undefined,
    status:          coarseStatus(t.status, marksCompletedByKey[t.status] ?? false),
    rawStatus:       t.status,
    taskNumber:      `#${t.taskNumber ?? t.id}`,
  };
}

type TabKey = 'tasks' | 'client' | 'messages' | 'team' | 'progress' | 'settings';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',    en: 'Tasks'    },
  { key: 'client',   ar: 'تحديثات العميل', en: 'Client Updates' },
  { key: 'messages', ar: 'الرسائل',   en: 'Messages' },
  { key: 'team',     ar: 'الفريق',    en: 'Team'     },
  { key: 'progress', ar: 'الإنجاز',   en: 'Progress' },
  { key: 'settings', ar: 'الإعدادات', en: 'Settings' },
];

/* ── Component ───────────────────────────────────────────────────────── */
export function CampaignDetailsPage() {
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const navigate    = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const tabParam = searchParams.get('tab');
  const initialTab: TabKey = tabParam === 'messages' ? 'messages' : 'tasks';
  const [activeTab,      setActiveTab]      = useState<TabKey>(initialTab);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // Keyed by task id → the real backend status key (not the coarse union).
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [changingStatus, setChangingStatus] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (tabParam === 'messages') setActiveTab('messages');
  }, [tabParam]);

  /* ── Campaign header ──────────────────────────────────────────────── */
  const { data: campaign, isLoading: campaignLoading, refetch: refetchCampaign } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn:  async () => (await campaignApi.getById(id)).data.data,
    enabled:   !!id,
    staleTime: 30_000,
  });

  const { data: projectStatuses = [] } = useQuery({
    queryKey: ['seo-project-statuses'],
    queryFn:  () => campaignApi.getStatuses().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });
  /* ── Task statuses — admin-configured, drives the Kanban columns ───── */
  const { data: statusesRaw, isLoading: statusesLoading } = useSeoTaskStatusList();
  const statuses = useMemo(
    () => (statusesRaw ?? []).filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [statusesRaw],
  );
  const marksCompletedByKey = useMemo(
    () => Object.fromEntries(statuses.map(s => [s.key, s.marksCompleted])),
    [statuses],
  );

  /* ── Tasks from backend ───────────────────────────────────────────────
     Uses the flat /v1/seo/manager/tasks?project_id= listing rather than the
     nested /v1/seo/manager/projects/{id}/tasks one — confirmed the nested
     endpoint doesn't reliably reflect newly created tasks, the flat one does. */
  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['campaign-tasks', id],
    queryFn:  async () => {
      const r = await campaignApi.listAllTasks({ project_id: id, per_page: 100 });
      return (r.data.data.phases ?? []).flatMap(p => p.tasks);
    },
    enabled:   !!id,
    staleTime: 30_000,
  });

  /* ── Derive tasks — no setState inside effect ─────────────────────── */
  const baseTasks = useMemo(
    () => (rawTasks ?? []).map(t => toLocalTask(t, id, marksCompletedByKey)),
    [rawTasks, id, marksCompletedByKey],
  );

  const tasks = useMemo(
    () => baseTasks.map(t =>
      statusOverrides[t.id]
        ? { ...t, rawStatus: statusOverrides[t.id], status: coarseStatus(statusOverrides[t.id], marksCompletedByKey[statusOverrides[t.id]] ?? false) }
        : t,
    ),
    [baseTasks, statusOverrides, marksCompletedByKey],
  );

  /* ── Drag-drop: optimistic status override + API call ─────────────── */
  function handleDrop(taskId: string, toStatusKey: string) {
    setStatusOverrides(prev => ({ ...prev, [taskId]: toStatusKey }));
    campaignApi
      .updateTaskStatus(id, taskId, toStatusKey)
      .catch(console.error);
  }

  async function handleStatusChange(nextStatus: string) {
    if (!campaign || nextStatus === campaign.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await campaignApi.updateProjectStatus(id, nextStatus);
      toast.success(isAr ? 'تم تحديث حالة المشروع' : 'Project status updated');
      await refetchCampaign();
      queryClient.invalidateQueries({ queryKey: ['seo-project-settings', id] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المشروع' : 'Failed to update status'));
    } finally {
      setChangingStatus(false);
    }
  }

  async function handlePublish() {
    if (!campaign?.isDraft || publishing) return;
    setPublishing(true);
    try {
      await campaignApi.updateSettings(id, {
        name:    campaign.name,
        isDraft: false,
      });
      toast.success(isAr ? 'تم نشر المشروع' : 'Project published');
      await refetchCampaign();
      queryClient.invalidateQueries({ queryKey: ['seo-project-settings', id] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر نشر المشروع' : 'Failed to publish project'));
    } finally {
      setPublishing(false);
    }
  }

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (campaignLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  const statusItems: ComboboxItem[] = projectStatuses.map(s => ({
    id:    s.value,
    label: translateProjectLookup(s.value, s.label, isAr),
  }));
  const tasksTotal = tasks.length;
  const tasksDone  = tasks.filter(t => marksCompletedByKey[t.rawStatus]).length;
  const progress   = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.SEO_LEADER.DASHBOARD)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                   hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
      >
        <ArrowLeft size={15} />
        {isAr ? 'العودة' : 'Back'}
      </button>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {campaign?.name ?? '—'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {translateProjectLookup(campaign?.campaignType ?? '', campaign?.campaignTypeLabel ?? '', isAr)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="w-40">
              <Combobox
                items={statusItems}
                value={campaign?.status ?? ''}
                onChange={handleStatusChange}
                disabled={changingStatus || statusItems.length === 0}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
                noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
              />
            </div>
            {campaign?.isDraft && (
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
        </div>
        {/* Tasks count + progress */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          <span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{tasksDone}</span>
            <span className="mx-1">/</span>
            {tasksTotal}
            <span className="ms-2 font-semibold text-gray-800 dark:text-gray-100">{progress}%</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Tabs + Add Task */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-end gap-1 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors
                            duration-150 whitespace-nowrap
                            ${isActive
                              ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {isAr ? tab.ar : tab.en}
              </button>
            );
          })}
        </div>
        {activeTab === 'tasks' && (
          <Button
            variant="primary"
            startIcon={<Plus size={16} />}
            onClick={() => navigate(ROUTES.SEO_LEADER.ADD_TASK(id))}
          >
            {isAr ? 'مهمة جديدة' : 'New Task'}
          </Button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' ? (
        tasksLoading || statusesLoading ? (
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex-1 min-w-62.5 h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 px-1">
            {statuses.map(status => (
              <SeoStatusColumn
                key={status.key}
                status={status}
                tasks={tasks.filter(t => t.rawStatus === status.key)}
                isAr={isAr}
                onDrop={handleDrop}
                onOpen={t => setSelectedTaskId(t.id)}
              />
            ))}
          </div>
        )
      ) : activeTab === 'client' ? (
        <SeoClientUpdatesTab isAr={isAr} />
      ) : activeTab === 'messages' ? (
        <ProjectMessages projectId={id} isAr={isAr} />
      ) : activeTab === 'team' ? (
        <SeoProjectTeamTab projectId={id} isAr={isAr} />
      ) : activeTab === 'progress' ? (
        <SeoProgressTab projectId={id} tasks={tasks} isAr={isAr} />
      ) : activeTab === 'settings' ? (
        <SeoProjectSettingsTab
          campaignId={id}
          isAr={isAr}
        />
      ) : (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'قريباً' : 'Coming soon'}
          </p>
        </div>
      )}

      {/* SEO Task Detail Drawer */}
      <SeoTaskDrawer
        taskId={selectedTaskId}
        projectId={id}
        onClose={() => setSelectedTaskId(null)}
        isAr={isAr}
      />

    </div>
  );
}
