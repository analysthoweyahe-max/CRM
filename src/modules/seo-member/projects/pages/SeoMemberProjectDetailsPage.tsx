import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, ExternalLink, Globe, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { RichTextView } from '@/shared/components/form/RichTextView';
import { GoogleDriveIcon } from '@/shared/components/icons/GoogleDriveIcon';
import { extractApiError } from '@/shared/utils/error.utils';
import { formatDateShort } from '@/shared/utils/date.utils';
import { ensureHttpUrl } from '@/shared/utils';
import { usePermission } from '@/shared/hooks/usePermission';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { taskResourceKey } from '@/shared/utils/resourceKey.utils';
import {
  findSeoTaskIdForComment,
  isSeoTaskCommentContext,
} from '@/shared/utils/mentionDeepLink.utils';
import { useSeoTaskLookups } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import type { SeoTaskStatusOption } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';
import type { SeoTask } from '@/modules/seo-leader/campaigns/api/campaign.api';
import { KanbanBoard as SharedKanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import { KanbanTaskCard } from '@/modules/project-manager/projects/components/KanbanTaskCard';
import { KanbanTaskFilters } from '@/modules/project-manager/projects/components/KanbanTaskFilters';
import {
  matchesTaskPeriod,
  type TaskPeriodFilter,
} from '@/modules/project-manager/projects/utils/kanbanTaskFilters.utils';
import { ProjectMessages } from '@/modules/seo-leader/campaigns/components/ProjectMessages';
import { SeoProgressTab } from '@/modules/seo-leader/campaigns/components/SeoProgressTab';
import { SeoProjectTeamTab } from '@/modules/seo-leader/projects/components/SeoProjectTeamTab';
import { myTasksApi } from '@/shared/modules/my-tasks/api/myTasks.api';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { Task, TaskStatus } from '@/modules/project-manager/tasks/types/task.types';

const UNASSIGNED = '__unassigned__';
const UNKNOWN_CREATOR = '__unknown_creator__';

type TabKey = 'tasks' | 'messages' | 'team' | 'progress' | 'info';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',  en: 'Tasks' },
  { key: 'info',     ar: 'التفاصيل', en: 'Details' },
  { key: 'messages', ar: 'الرسائل', en: 'Messages' },
  { key: 'team',     ar: 'الفريق',  en: 'Team' },
  { key: 'progress', ar: 'الإنجاز', en: 'Progress' },
];

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-sky-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500',
];

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function coarseStatus(rawKey: string, marksCompleted: boolean): TaskStatus {
  if (marksCompleted) return 'completed';
  if (rawKey === 'in_progress') return 'in_progress';
  if (rawKey === 'in_review' || rawKey === 'review') return 'needs_review';
  return 'pending';
}

const PRIORITY_MAP: Record<string, Task['priority']> = {
  urgent: 'urgent',
  high:   'high',
  normal: 'normal',
  medium: 'normal',
  low:    'low',
};

export interface SeoMemberTaskVM extends Task {
  rawStatus: string;
  assigneeIds: string[];
}

function toLocalTask(
  t: SeoTask,
  projectId: string,
  marksCompletedByKey: Record<string, boolean>,
): SeoMemberTaskVM {
  const primary = t.assignees?.[0]
    ?? (t as SeoTask & { assignee?: { id?: string; name?: string } }).assignee;
  const assignee = primary?.name ?? '';
  const createdBy = t.createdBy ?? t.created_by ?? null;
  const assigneeIds = (t.assignees ?? [])
    .map(a => a.id)
    .filter(Boolean);
  if (assigneeIds.length === 0 && primary?.id) assigneeIds.push(String(primary.id));
  return {
    id:              String(t.id),
    uuid:            t.uuid || undefined,
    projectId,
    title:           t.title,
    description:     t.description ?? '',
    phaseName:       t.phase ?? t.taskTypeLabel ?? 'مهمة SEO',
    priority:        PRIORITY_MAP[t.priority] ?? 'normal',
    assigneeId:      primary?.id ? String(primary.id) : undefined,
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

/** Member-facing project workspace: full details + self-create tasks (no admin controls). */
export function SeoMemberProjectDetailsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const canAddTask = usePermission(['edit-seo-tasks', 'create-seo-project']);

  const tabParam = searchParams.get('tab');
  const commentParam = searchParams.get('comment') ?? searchParams.get('commentId');
  const contextTypeParam = searchParams.get('contextType');
  const initialTab: TabKey =
    tabParam === 'messages' || tabParam === 'team' || tabParam === 'progress' || tabParam === 'info'
      ? tabParam
      : 'tasks';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tabParam === 'messages') setActiveTab('messages');
  }, [tabParam]);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['seo-member-project', id],
    queryFn:  async () => (await campaignApi.getById(id)).data.data,
    enabled:  !!id,
    staleTime: 30_000,
    retry: 1,
  });

  const projectKey = campaign ? String(campaign.id) : id;

  const { data: settings } = useQuery({
    queryKey: ['seo-member-project-settings', projectKey],
    queryFn:  async () => (await campaignApi.getSettings(projectKey)).data.data,
    enabled:  !!projectKey,
    staleTime: 30_000,
    retry: 1,
  });

  const { statusOptions: statuses, isLoading: statusesLoading } = useSeoTaskLookups(isAr);
  const marksCompletedByKey = useMemo(
    () => Object.fromEntries(statuses.map(s => [s.key, s.marksCompleted])),
    [statuses],
  );
  const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [creatorFilter,  setCreatorFilter]  = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [periodFilter,   setPeriodFilter]   = useState<TaskPeriodFilter>('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');

  /* GET /v1/seo/employee/projects/{id}/tasks — the member-scoped route.
     /v1/seo/manager/tasks (used by CampaignDetailsPage) is manager-guarded
     and isn't valid for an employee token. */
  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['seo-member-project-tasks', projectKey],
    queryFn: async () => {
      const r = await campaignApi.getEmployeeTasks(projectKey, { per_page: 100 });
      return (r.data.data.phases ?? []).flatMap(p => p.tasks);
    },
    enabled: !!projectKey,
    staleTime: 30_000,
  });

  const baseTasks = useMemo(
    () => (rawTasks ?? []).map(t => toLocalTask(t, projectKey, marksCompletedByKey)),
    [rawTasks, projectKey, marksCompletedByKey],
  );

  const tasks = useMemo(
    () => baseTasks.map(t =>
      statusOverrides[t.id]
        ? {
            ...t,
            rawStatus: statusOverrides[t.id],
            status: coarseStatus(
              statusOverrides[t.id],
              marksCompletedByKey[statusOverrides[t.id]] ?? false,
            ),
          }
        : t,
    ),
    [baseTasks, statusOverrides, marksCompletedByKey],
  );

  /* Mention deep-link: resolve SeoTaskComment → task detail. */
  useEffect(() => {
    if (!commentParam || !isSeoTaskCommentContext(contextTypeParam ?? 'SeoTaskComment')) return;
    if (tasks.length === 0) return;

    let cancelled = false;
    const keys = tasks.map(t => taskResourceKey(t));

    void findSeoTaskIdForComment(projectKey, keys, commentParam).then((taskKey) => {
      if (cancelled || !taskKey) return;
      setSearchParams({}, { replace: true });
      navigate(
        `${ROUTES.SEO_MEMBER.TASK_DETAIL(projectKey, taskKey)}?tab=comments&comment=${encodeURIComponent(commentParam)}`,
      );
    });

    return () => { cancelled = true; };
  }, [commentParam, contextTypeParam, tasks, projectKey, navigate, setSearchParams]);

  const assigneeItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const raw of rawTasks ?? []) {
      for (const a of raw.assignees ?? []) {
        if (a.id) map.set(String(a.id), { id: String(a.id), label: a.name || String(a.id) });
      }
      const single = (raw as SeoTask & { assignee?: { id?: string; name?: string } }).assignee;
      if (single?.id) map.set(String(single.id), { id: String(single.id), label: single.name || String(single.id) });
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (assigneeFilter === UNASSIGNED) return t.assigneeIds.length === 0;
      if (assigneeFilter && !t.assigneeIds.includes(assigneeFilter)) return false;
      if (creatorFilter === UNKNOWN_CREATOR) return !t.createdById;
      if (creatorFilter && t.createdById !== creatorFilter) return false;
      if (statusFilter && t.rawStatus !== statusFilter) return false;
      if (!matchesTaskPeriod(t.createdAt, periodFilter, dateFrom, dateTo)) return false;
      return true;
    });
  }, [
    tasks, assigneeFilter, creatorFilter, statusFilter,
    periodFilter, dateFrom, dateTo,
  ]);

  const hasActiveFilters = !!assigneeFilter || !!creatorFilter || !!statusFilter || !!periodFilter;

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

  const phaseColumns = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      const key = t.phaseName || (isAr ? 'بدون مرحلة' : 'No phase');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key, label: key, color: colorForKey(key), items,
    }));
  }, [filteredTasks, isAr]);

  function handleDrop(taskId: string, toStatusKey: string) {
    const task = tasks.find(t => t.id === taskId || t.uuid === taskId);
    setStatusOverrides(prev => ({ ...prev, [taskId]: toStatusKey }));
    myTasksApi
      .updateStatus('seo-employee', projectKey, task ? taskResourceKey(task) : taskId, toStatusKey)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['seo-member-project-tasks', projectKey] });
        qc.invalidateQueries({ queryKey: ['my-tasks'] });
        qc.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
        qc.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
        qc.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      })
      .catch((err) => {
        setStatusOverrides(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
      });
  }

  function handleOpenTask(task: Task) {
    navigate(ROUTES.SEO_MEMBER.TASK_DETAIL(projectKey, taskResourceKey(task)));
  }

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

  const name = campaign?.name ?? settings?.name ?? '—';
  const typeLabel = translateProjectLookup(
    campaign?.campaignType ?? settings?.campaignType ?? '',
    campaign?.campaignTypeLabel ?? settings?.campaignTypeLabel ?? '',
    isAr,
  );
  const statusLabel = campaign?.statusLabel ?? settings?.statusLabel ?? campaign?.status ?? '';
  const description = campaign?.description ?? settings?.description ?? '';
  const domain = campaign?.targetDomain ?? settings?.targetDomain ?? null;
  const startDate = campaign?.startDate ?? settings?.startDate ?? '';
  const endDate = campaign?.expectedEndDate ?? settings?.expectedEndDate ?? null;
  const github = campaign?.githubLink ?? settings?.githubLink ?? null;
  const drive = campaign?.driveLink ?? settings?.driveLink ?? null;
  const contractMonths = campaign?.contractDurationMonths ?? settings?.contractDurationMonths ?? null;
  const keywords = campaign?.targetKeywords ?? [];

  const tasksTotal = tasks.length;
  const tasksDone = tasks.filter(t => marksCompletedByKey[t.rawStatus]).length;
  const progress = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => navigate(ROUTES.SEO_MEMBER.MY_PROJECTS)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                   hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
      >
        <ArrowLeft size={15} />
        {isAr ? 'العودة لمشاريعي' : 'Back to My Projects'}
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
                {name}
              </h1>
              {drive && (
                <a
                  href={ensureHttpUrl(drive)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={isAr ? 'فتح Google Drive' : 'Open Google Drive'}
                  aria-label={isAr ? 'رابط Google Drive' : 'Google Drive Link'}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200
                             dark:border-gray-600 transition-colors shrink-0
                             hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <GoogleDriveIcon size={18} />
                </a>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{typeLabel}</p>
            {statusLabel && (
              <span className="inline-flex mt-2 text-xs px-2.5 py-1 rounded-full
                               bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]">
                {statusLabel}
              </span>
            )}
          </div>
          {domain && (
            <a
              href={domain.startsWith('http') ? domain : `https://${domain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#709028] dark:text-[#A0CD39] hover:underline"
            >
              <Globe size={14} />
              {domain}
            </a>
          )}
        </div>

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
            onClick={() => navigate(ROUTES.SEO_MEMBER.ADD_TASK(id))}
          >
            {isAr ? 'مهمة جديدة' : 'New Task'}
          </Button>
        )}
      </div>

      {activeTab === 'tasks' && (
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
              phase=""
              assignee={assigneeFilter}
              creator={creatorFilter}
              status={statusFilter}
              period={periodFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              phaseItems={[{ id: '', label: isAr ? 'كل المراحل' : 'All phases' }]}
              assigneeItems={assigneeItems}
              creatorItems={creatorItems}
              statusItems={taskStatusItems}
              onPhase={() => {}}
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
              hidePhase
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
                <KanbanTaskCard task={task} isAr={isAr} onOpen={handleOpenTask} />
              )}
              onDrop={viewMode === 'status' ? handleDrop : () => {}}
              draggable={viewMode === 'status'}
            />
          </>
        )
      )}

      {activeTab === 'info' && (
        <Card className="p-6 space-y-5">
          {description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {isAr ? 'الوصف' : 'Description'}
              </h3>
              <RichTextView
                html={description}
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={<Calendar size={14} />}
              label={isAr ? 'تاريخ البدء' : 'Start date'}
              value={startDate ? formatDateShort(startDate, isAr) : '—'}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label={isAr ? 'الانتهاء المتوقع' : 'Expected end'}
              value={endDate ? formatDateShort(endDate, isAr) : '—'}
            />
            {contractMonths != null && contractMonths > 0 && (
              <InfoRow
                label={isAr ? 'مدة العقد' : 'Contract'}
                value={isAr ? `${contractMonths} شهر` : `${contractMonths} mo`}
              />
            )}
            {github && (
              <InfoRow
                icon={<ExternalLink size={14} />}
                label="GitHub"
                value={
                  <a href={github} target="_blank" rel="noreferrer" className="text-[#709028] dark:text-[#A0CD39] hover:underline break-all">
                    {github}
                  </a>
                }
              />
            )}
            {drive && (
              <InfoRow
                icon={<ExternalLink size={14} />}
                label="Drive"
                value={
                  <a href={drive} target="_blank" rel="noreferrer" className="text-[#709028] dark:text-[#A0CD39] hover:underline break-all">
                    {drive}
                  </a>
                }
              />
            )}
          </div>

          {keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {isAr ? 'الكلمات المفتاحية' : 'Keywords'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map(k => (
                  <span
                    key={k}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'messages' && (
        <ProjectMessages projectId={projectKey} isAr={isAr} />
      )}

      {activeTab === 'team' && (
        <SeoProjectTeamTab projectId={projectKey} isAr={isAr} readOnly />
      )}

      {activeTab === 'progress' && (
        <SeoProgressTab projectId={projectKey} tasks={tasks} isAr={isAr} />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  );
}
