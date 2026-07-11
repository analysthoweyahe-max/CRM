import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, ExternalLink, Globe, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { extractApiError } from '@/shared/utils/error.utils';
import { formatDateShort } from '@/shared/utils/date.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { resourceKey, taskResourceKey } from '@/shared/utils/resourceKey.utils';
import { http } from '@/shared/services/http.service';
import { useSeoTaskStatusList } from '@/modules/admin/seo-task-statuses/hooks/useSeoTaskStatuses';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';
import type { SeoTask } from '@/modules/seo-leader/campaigns/api/campaign.api';
import { SeoStatusColumn } from '@/modules/seo-leader/campaigns/components/SeoStatusColumn';
import { ProjectMessages } from '@/modules/seo-leader/campaigns/components/ProjectMessages';
import { SeoProgressTab } from '@/modules/seo-leader/campaigns/components/SeoProgressTab';
import { SeoProjectTeamTab } from '@/modules/seo-leader/projects/components/SeoProjectTeamTab';
import { AddSelfSeoTaskModal } from '@/modules/seo-member/tasks/components/AddSelfSeoTaskModal';
import { myTasksApi } from '@/shared/modules/my-tasks/api/myTasks.api';
import type { Task, TaskStatus } from '@/modules/project-manager/tasks/types/task.types';

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
}

function toLocalTask(
  t: SeoTask,
  projectId: string,
  marksCompletedByKey: Record<string, boolean>,
): SeoMemberTaskVM {
  const assignee = t.assignees?.[0]?.name
    ?? (t as SeoTask & { assignee?: { name?: string } }).assignee?.name
    ?? '';
  return {
    id:              String(t.id),
    uuid:            t.uuid || undefined,
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

/** Member-facing project workspace: full details + self-create tasks (no admin controls). */
export function SeoMemberProjectDetailsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const tabParam = searchParams.get('tab');
  const initialTab: TabKey =
    tabParam === 'messages' || tabParam === 'team' || tabParam === 'progress' || tabParam === 'info'
      ? tabParam
      : 'tasks';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [showAddTask, setShowAddTask] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['seo-member-project', id],
    queryFn:  async () => (await campaignApi.getById(id)).data.data,
    enabled:  !!id,
    staleTime: 30_000,
    retry: 1,
  });

  const projectKey = campaign ? resourceKey(campaign) : id;

  const { data: settings } = useQuery({
    queryKey: ['seo-member-project-settings', projectKey],
    queryFn:  async () => (await campaignApi.getSettings(projectKey)).data.data,
    enabled:  !!projectKey,
    staleTime: 30_000,
    retry: 1,
  });

  const { data: statusesRaw, isLoading: statusesLoading } = useSeoTaskStatusList();
  const statuses = useMemo(
    () => (statusesRaw ?? []).filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [statusesRaw],
  );
  const marksCompletedByKey = useMemo(
    () => Object.fromEntries(statuses.map(s => [s.key, s.marksCompleted])),
    [statuses],
  );

  /* All project tasks visible to the member (mine=0); falls back if API ignores it. */
  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['seo-member-project-tasks', projectKey],
    queryFn: async () => {
      const { data } = await http.get<{
        status: string;
        message: string;
        data: { phases?: { phase: string; tasks: SeoTask[] }[]; columns?: { status: string; tasks: SeoTask[] }[]; total?: number };
      }>(`/v1/seo/employee/projects/${projectKey}/tasks`, { params: { mine: 0 } });
      const payload = data.data;
      if (Array.isArray(payload.phases)) {
        return payload.phases.flatMap(p => p.tasks);
      }
      if (Array.isArray(payload.columns)) {
        return payload.columns.flatMap(c => c.tasks);
      }
      return [] as SeoTask[];
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

  function handleDrop(taskId: string, toStatusKey: string) {
    const task = tasks.find(t => t.id === taskId || t.uuid === taskId);
    setStatusOverrides(prev => ({ ...prev, [taskId]: toStatusKey }));
    myTasksApi
      .updateStatus('seo-employee', projectKey, task ? taskResourceKey(task) : taskId, toStatusKey)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['seo-member-project-tasks', projectKey] });
        qc.invalidateQueries({ queryKey: ['my-tasks'] });
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {name}
            </h1>
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
            onClick={() => setShowAddTask(true)}
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
          <div className="flex gap-5 overflow-x-auto pb-4 px-1">
            {statuses.map(status => (
              <SeoStatusColumn
                key={status.key}
                status={status}
                tasks={tasks.filter(t => t.rawStatus === status.key)}
                isAr={isAr}
                onDrop={handleDrop}
                onOpen={handleOpenTask}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'info' && (
        <Card className="p-6 space-y-5">
          {description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {isAr ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
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

      <AddSelfSeoTaskModal
        open={showAddTask}
        onClose={() => {
          setShowAddTask(false);
          qc.invalidateQueries({ queryKey: ['seo-member-project-tasks', projectKey] });
        }}
        isAr={isAr}
        initialProjectId={projectKey}
        lockProject
      />
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
