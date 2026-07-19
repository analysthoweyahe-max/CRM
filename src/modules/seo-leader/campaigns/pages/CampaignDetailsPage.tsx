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
import { usePermission }          from '@/shared/hooks/usePermission';
import { campaignApi }                       from '../api/campaign.api';
import type { SeoTask }                      from '../api/campaign.api';
import { SeoTaskDrawer }          from '../components/SeoTaskDrawer';
import { ProjectMessages }        from '../components/ProjectMessages';
import { SeoProjectTeamTab }      from '../../projects/components/SeoProjectTeamTab';
import { SeoProjectSettingsTab }  from '../components/SeoProjectSettingsTab';
import { SeoProgressTab }         from '../components/SeoProgressTab';
import { SeoClientUpdatesTab }    from '../components/SeoClientUpdatesTab';
import { useSeoTaskLookups, SEO_TASK_PHASE_ITEMS } from '../hooks/useSeoTaskLookups';
import type { SeoTaskStatusOption } from '../hooks/useSeoTaskLookups';
import { KanbanBoard as SharedKanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey }            from '@/shared/components/kanban/kanbanColors';
import { KanbanTaskCard }         from '@/modules/project-manager/projects/components/KanbanTaskCard';
import { KanbanTaskFilters }      from '@/modules/project-manager/projects/components/KanbanTaskFilters';
import {
  matchesTaskPeriod,
  type TaskPeriodFilter,
} from '@/modules/project-manager/projects/utils/kanbanTaskFilters.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { taskResourceKey } from '@/shared/utils/resourceKey.utils';
import type { Task, TaskStatus }  from '@/modules/project-manager/tasks/types/task.types';

const UNASSIGNED = '__unassigned__';
const UNKNOWN_CREATOR = '__unknown_creator__';

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
  /** All assignee ids on the SEO task (list may have multiple). */
  assigneeIds: string[];
}

function toLocalTask(t: SeoTask, projectId: string, marksCompletedByKey: Record<string, boolean>): SeoTaskVM {
  const primary = t.assignees?.[0];
  const assignee = primary?.name ?? '';
  const createdBy = t.createdBy ?? t.created_by ?? null;
  const assigneeIds = (t.assignees ?? []).map(a => a.id).filter(Boolean);
  return {
    id:              String(t.id),
    uuid:            t.uuid || undefined,
    projectId,
    title:           t.title,
    description:     t.description ?? '',
    phaseName:       t.phase ?? t.taskTypeLabel ?? 'مهمة SEO',
    priority:        PRIORITY_MAP[t.priority] ?? 'normal',
    assigneeId:      primary?.id,
    assigneeName:    assignee,
    assigneeInitial: assignee ? assignee[0].toUpperCase() : '?',
    assigneeColor:   avatarColor(assignee),
    dueDate:         t.dueDate ?? '',
    estimatedHours:  undefined,
    status:          coarseStatus(t.status, marksCompletedByKey[t.status] ?? false),
    rawStatus:       t.status,
    taskNumber:      `#${t.taskNumber ?? t.id}`,
    importantLinks:  t.importantLinks,
    createdAt:       t.createdAt,
    createdById:     createdBy?.id,
    createdByName:   createdBy?.name,
    assigneeIds,
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
  const canAddTask  = usePermission(['edit-seo-tasks', 'create-seo-project']);

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

  const projectKey = campaign ? String(campaign.id) : id;

  const { data: projectStatuses = [] } = useQuery({
    queryKey: ['seo-project-statuses'],
    queryFn:  () => campaignApi.getStatuses().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });
  /* ── Task statuses — project-scoped lookup, drives the Kanban columns ── */
  const { statusOptions: statuses, isLoading: statusesLoading } = useSeoTaskLookups(isAr);
  const marksCompletedByKey = useMemo(
    () => Object.fromEntries(statuses.map(s => [s.key, s.marksCompleted])),
    [statuses],
  );
  const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');
  const [phaseFilter,    setPhaseFilter]    = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [creatorFilter,  setCreatorFilter]  = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [periodFilter,   setPeriodFilter]   = useState<TaskPeriodFilter>('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');

  /* ── Tasks from backend ───────────────────────────────────────────────
     GET /v1/seo/projects/{id}/tasks — the unified path, valid for both
     super-admin and the project's SEO manager. /v1/seo/manager/tasks is
     manager-guarded only: a super-admin token gets a 401 there, which the
     global axios interceptor treats as an invalid session and force-logs
     the user out (surfaces as this page silently redirecting to login). */
  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['campaign-tasks', projectKey],
    queryFn:  async () => {
      const r = await campaignApi.getTasks(projectKey, { per_page: 100 });
      return (r.data.data.phases ?? []).flatMap(p => p.tasks);
    },
    enabled:   !!projectKey,
    staleTime: 30_000,
  });

  /* ── Derive tasks — no setState inside effect ─────────────────────── */
  const baseTasks = useMemo(
    () => (rawTasks ?? []).map(t => toLocalTask(t, projectKey, marksCompletedByKey)),
    [rawTasks, projectKey, marksCompletedByKey],
  );

  const tasks = useMemo(
    () => baseTasks.map(t =>
      statusOverrides[t.id]
        ? { ...t, rawStatus: statusOverrides[t.id], status: coarseStatus(statusOverrides[t.id], marksCompletedByKey[statusOverrides[t.id]] ?? false) }
        : t,
    ),
    [baseTasks, statusOverrides, marksCompletedByKey],
  );

  const assigneeItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const raw of rawTasks ?? []) {
      for (const a of raw.assignees ?? []) {
        if (a.id) map.set(a.id, { id: a.id, label: a.name || a.id });
      }
    }
    const items = [
      { id: '', label: isAr ? 'كل المسؤولين' : 'All assignees' },
      ...Array.from(map.values()),
    ];
    if (tasks.some(t => t.assigneeIds.length === 0)) {
      items.push({ id: UNASSIGNED, label: isAr ? 'بدون مسؤول' : 'Unassigned' });
    }
    return items;
  }, [rawTasks, tasks, isAr]);

  const creatorItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const t of tasks) {
      if (t.createdById) {
        map.set(t.createdById, {
          id: t.createdById,
          label: t.createdByName || t.createdById,
        });
      }
    }
    const items = [
      { id: '', label: isAr ? 'كل المنشئين' : 'All creators' },
      ...Array.from(map.values()),
    ];
    if (tasks.some(t => !t.createdById)) {
      items.push({ id: UNKNOWN_CREATOR, label: isAr ? 'غير معروف' : 'Unknown' });
    }
    return items;
  }, [tasks, isAr]);

  const taskStatusItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الحالات' : 'All statuses' },
    ...statuses.map(s => ({ id: s.key, label: s.label })),
  ], [statuses, isAr]);

  const phaseItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const item of SEO_TASK_PHASE_ITEMS) {
      // Forms store the Arabic display label as the phase value.
      map.set(item.label, { id: item.label, label: item.label });
    }
    for (const t of tasks) {
      const name = t.phaseName?.trim();
      if (name) map.set(name, { id: name, label: name });
    }
    return [
      { id: '', label: isAr ? 'كل المراحل' : 'All phases' },
      ...Array.from(map.values()),
    ];
  }, [tasks, isAr]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (phaseFilter && t.phaseName !== phaseFilter) return false;
      if (assigneeFilter === UNASSIGNED) return t.assigneeIds.length === 0;
      if (assigneeFilter && !t.assigneeIds.includes(assigneeFilter)) return false;
      if (creatorFilter === UNKNOWN_CREATOR) return !t.createdById;
      if (creatorFilter && t.createdById !== creatorFilter) return false;
      if (statusFilter && t.rawStatus !== statusFilter) return false;
      if (!matchesTaskPeriod(t.createdAt, periodFilter, dateFrom, dateTo)) return false;
      return true;
    });
  }, [
    tasks, phaseFilter, assigneeFilter, creatorFilter, statusFilter,
    periodFilter, dateFrom, dateTo,
  ]);

  const hasActiveFilters = !!phaseFilter || !!assigneeFilter || !!creatorFilter
    || !!statusFilter || !!periodFilter;

  /* ── Fallback columns ──────────────────────────────────────────────────
     A task's rawStatus is whatever the backend stored on it, which can
     drift from the *currently active* admin-configured status catalog (a
     status got renamed/deactivated after tasks were created, etc). Tasks
     that don't match any active status used to be silently dropped from
     the board — this synthesizes a read-only column per unmatched key so
     they stay visible instead of vanishing. */
  const displayColumns: SeoTaskStatusOption[] = useMemo(() => {
    const known = new Set(statuses.map(s => s.key));
    const extras: SeoTaskStatusOption[] = [];
    const seen = new Set<string>();
    filteredTasks.forEach(t => {
      if (!known.has(t.rawStatus) && !seen.has(t.rawStatus)) {
        seen.add(t.rawStatus);
        extras.push({
          key: t.rawStatus,
          label: t.rawStatus,
          color: '#9CA3AF',
          sortOrder: 999 + extras.length,
          isActive: true,
          marksCompleted: false,
        });
      }
    });
    const all = [...statuses, ...extras];
    if (!statusFilter) return all;
    const matched = all.filter(s => s.key === statusFilter);
    if (matched.length > 0) return matched;
    return [{
      key: statusFilter,
      label: statusFilter,
      color: '#9CA3AF',
      sortOrder: 0,
      isActive: true,
      marksCompleted: false,
    }];
  }, [statuses, filteredTasks, statusFilter]);

  /* ── Phase columns — grouped by the task's phaseName.
     A selected phase filter keeps only that column. ───────────────────── */
  const phaseColumns = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      const key = t.phaseName || (isAr ? 'بدون مرحلة' : 'No phase');
      if (phaseFilter && key !== phaseFilter) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    if (phaseFilter && !map.has(phaseFilter)) {
      map.set(phaseFilter, []);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key, label: key, color: colorForKey(key), items,
    }));
  }, [filteredTasks, isAr, phaseFilter]);

  /* ── Drag-drop: optimistic status override + API call ───────────────
     Not the dedicated PATCH .../status sub-route — per the backend's own
     Postman collection, that route is only ever exercised with an employee
     token; a manager (admin token) instead goes through the general
     task-update endpoint with `status` in the body. */
  function handleDrop(taskId: string, toStatusKey: string) {
    const task = tasks.find(t => t.id === taskId || t.uuid === taskId);
    setStatusOverrides(prev => ({ ...prev, [taskId]: toStatusKey }));
    campaignApi
      .updateTask(projectKey, task ? taskResourceKey(task) : taskId, { status: toStatusKey })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectKey] });
        queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
      })
      .catch((err) => {
        console.error(err);
        toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
      });
  }

  /* ── Drag-drop: phase change — unverified against the real backend, see
     the `phase` field comment on SeoUpdateTaskPayload. */
  function handlePhaseDrop(taskId: string, toPhaseName: string) {
    const task = tasks.find(t => t.id === taskId || t.uuid === taskId);
    if (!task) return;
    campaignApi
      .updateTask(projectKey, taskResourceKey(task), { phase: toPhaseName })
      .then(() => queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectKey] }))
      .catch((err) => {
        console.error(err);
        toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث مرحلة المهمة' : 'Failed to update task phase'));
      });
  }

  async function handleStatusChange(nextStatus: string) {
    if (!campaign || nextStatus === campaign.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await campaignApi.updateProjectStatus(projectKey, nextStatus);
      toast.success(isAr ? 'تم تحديث حالة المشروع' : 'Project status updated');
      await refetchCampaign();
      queryClient.invalidateQueries({ queryKey: ['seo-project-settings', projectKey] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
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
      await campaignApi.updateSettings(projectKey, {
        name:    campaign.name,
        isDraft: false,
      });
      toast.success(isAr ? 'تم نشر المشروع' : 'Project published');
      await refetchCampaign();
      queryClient.invalidateQueries({ queryKey: ['seo-project-settings', projectKey] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
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
        {/* Tasks count + progress — only when there are real tasks */}
        {tasksTotal > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
              <span
                className="inline-flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 tabular-nums"
                dir="ltr"
              >
                <span aria-label={isAr ? 'المهام المكتملة من الإجمالي' : 'Completed of total'}>
                  {tasksDone}/{tasksTotal}
                </span>
                <span className="text-gray-300 dark:text-gray-600 font-normal" aria-hidden>|</span>
                <span aria-label={isAr ? 'نسبة الإنجاز' : 'Progress percent'}>
                  {progress}%
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
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
        {activeTab === 'tasks' && canAddTask && (
          <Button
            variant="primary"
            startIcon={<Plus size={16} />}
            onClick={() => navigate(ROUTES.SEO_LEADER.ADD_TASK(projectKey))}
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
          <>
            <div className="flex items-center justify-between gap-3 mb-3 px-1">
              <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-900/40">
                {(['status', 'phase'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={[
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-800 text-[#709028] dark:text-[#A0CD39] shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                    ].join(' ')}
                  >
                    {mode === 'status' ? (isAr ? 'الحالة' : 'Status') : (isAr ? 'المرحلة' : 'Phase')}
                  </button>
                ))}
              </div>
            </div>
            <KanbanTaskFilters
              isAr={isAr}
              phase={phaseFilter}
              assignee={assigneeFilter}
              creator={creatorFilter}
              status={statusFilter}
              period={periodFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              phaseItems={phaseItems}
              assigneeItems={assigneeItems}
              creatorItems={creatorItems}
              statusItems={taskStatusItems}
              onPhase={setPhaseFilter}
              onAssignee={setAssigneeFilter}
              onCreator={setCreatorFilter}
              onStatus={setStatusFilter}
              onPeriod={(value) => {
                setPeriodFilter(value);
                if (value !== 'custom') {
                  setDateFrom('');
                  setDateTo('');
                }
              }}
              onDateFrom={setDateFrom}
              onDateTo={setDateTo}
              onClear={() => {
                setPhaseFilter('');
                setAssigneeFilter('');
                setCreatorFilter('');
                setStatusFilter('');
                setPeriodFilter('');
                setDateFrom('');
                setDateTo('');
              }}
              hasActive={hasActiveFilters}
              resultCount={filteredTasks.length}
              totalCount={tasks.length}
            />
            <SharedKanbanBoard
              columns={
                viewMode === 'status'
                  ? displayColumns.map(status => ({
                      key:   status.key,
                      label: status.label,
                      color: status.color,
                      items: filteredTasks.filter(t => t.rawStatus === status.key),
                    }))
                  : phaseColumns
              }
              isAr={isAr}
              getId={(task: Task) => task.id}
              renderCard={(task: Task) => (
                <KanbanTaskCard task={task} isAr={isAr} onOpen={t => setSelectedTaskId(taskResourceKey(t))} />
              )}
              onDrop={viewMode === 'status' ? handleDrop : handlePhaseDrop}
            />
          </>
        )
      ) : activeTab === 'client' ? (
        <SeoClientUpdatesTab isAr={isAr} />
      ) : activeTab === 'messages' ? (
        <ProjectMessages projectId={projectKey} isAr={isAr} />
      ) : activeTab === 'team' ? (
        <SeoProjectTeamTab projectId={projectKey} isAr={isAr} />
      ) : activeTab === 'progress' ? (
        <SeoProgressTab projectId={projectKey} tasks={tasks} isAr={isAr} />
      ) : activeTab === 'settings' ? (
        <SeoProjectSettingsTab
          campaignId={projectKey}
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
        projectId={projectKey}
        onClose={() => setSelectedTaskId(null)}
        isAr={isAr}
      />

    </div>
  );
}
