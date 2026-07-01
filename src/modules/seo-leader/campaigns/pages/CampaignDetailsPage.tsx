import { useState, useEffect }   from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus }        from 'lucide-react';
import { useQuery }               from '@tanstack/react-query';
import { useLang }                from '@/app/providers/LanguageProvider';
import { Card }                   from '@/shared/components/ui/Card';
import { Button }                 from '@/shared/components/ui/Button';
import { ROUTES }                 from '@/app/router/routes';
import { campaignApi }                       from '../api/campaign.api';
import type { SeoTask }                      from '../api/campaign.api';
import { AddSeoTaskModal }        from '../components/AddSeoTaskModal';
import { SeoTaskDrawer }          from '../components/SeoTaskDrawer';
import { ProjectMessages }        from '../components/ProjectMessages';
import { SeoProjectTeamTab }      from '../../projects/components/SeoProjectTeamTab';
import { KanbanColumn }           from '@/modules/project-manager/projects/components/KanbanColumn';
import type { Task, TaskStatus }  from '@/modules/project-manager/tasks/types/task.types';

/* ── Status mapping: PM TaskStatus → backend status string ───────────── */
const STATUS_TO_BACKEND: Record<TaskStatus, string> = {
  pending:    'pending',
  inProgress: 'in_progress',
  review:     'in_review',
  completed:  'completed',
};

/* ── Status mapping: backend → PM TaskStatus ─────────────────────────── */
const STATUS_FROM_BACKEND: Record<string, TaskStatus> = {
  pending:     'pending',
  in_progress: 'inProgress',
  inProgress:  'inProgress',
  in_review:   'review',
  review:      'review',
  completed:   'completed',
  done:        'completed',
};

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
  high:   'high',
  normal: 'medium',
  medium: 'medium',
  low:    'low',
};

function toLocalTask(t: SeoTask, projectId: string): Task {
  const assignee = t.assignees?.[0]?.name ?? '';
  return {
    id:              String(t.id),
    projectId,
    title:           t.title,
    description:     t.description ?? '',
    categoryAr:      t.taskTypeLabel ?? 'مهمة SEO',
    categoryEn:      t.taskType      ?? 'SEO Task',
    priority:        PRIORITY_MAP[t.priority] ?? 'medium',
    assigneeName:    assignee,
    assigneeInitial: assignee ? assignee[0].toUpperCase() : '?',
    assigneeColor:   avatarColor(assignee),
    dueDate:         t.dueDate ?? '',
    estimatedHours:  undefined,
    status:          STATUS_FROM_BACKEND[t.status] ?? 'pending',
    taskNumber:      `#${t.taskNumber ?? t.id}`,
  };
}

/* ── Constants ───────────────────────────────────────────────────────── */
const KANBAN_COLS: TaskStatus[] = ['pending', 'inProgress', 'review', 'completed'];

type TabKey = 'tasks' | 'client' | 'messages' | 'team' | 'progress' | 'settings';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'tasks',    ar: 'المهام',    en: 'Tasks'    },
  { key: 'client',   ar: 'العميل',    en: 'Client'   },
  { key: 'messages', ar: 'الرسائل',   en: 'Messages' },
  { key: 'team',     ar: 'الفريق',    en: 'Team'     },
  { key: 'progress', ar: 'الإنجاز',   en: 'Progress' },
  { key: 'settings', ar: 'الإعدادات', en: 'Settings' },
];

const STATUS_BADGE: Record<string, string> = {
  in_progress: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]',
  not_started: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

/* ── Component ───────────────────────────────────────────────────────── */
export function CampaignDetailsPage() {
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const navigate    = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const [activeTab,     setActiveTab]     = useState<TabKey>('tasks');
  const [tasks,         setTasks]         = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddTask,   setShowAddTask]   = useState(false);

  /* ── Campaign header ──────────────────────────────────────────────── */
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn:  async () => (await campaignApi.getById(id)).data.data,
    enabled:   !!id,
    staleTime: 30_000,
  });

  /* ── Tasks from backend ───────────────────────────────────────────── */
  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['campaign-tasks', id],
    queryFn:  async () => {
      const r = await campaignApi.getTasks(id);
      return (r.data.data.phases ?? []).flatMap(p => p.tasks);
    },
    enabled:   !!id,
    staleTime: 30_000,
  });

  /* ── Sync fetched tasks → local state ─────────────────────────────── */
  useEffect(() => {
    if (rawTasks) setTasks(rawTasks.map(t => toLocalTask(t, id)));
  }, [rawTasks, id]);

  /* ── Immediately add newly created task to local state ───────────── */
  function handleTaskCreated(task: SeoTask) {
    setTasks(prev => [...prev, toLocalTask(task, id)]);
  }

  /* ── Drag-drop: update locally + call status API ──────────────────── */
  function handleDrop(taskId: string, toStatus: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toStatus } : t));
    campaignApi
      .updateTaskStatus(id, taskId, STATUS_TO_BACKEND[toStatus])
      .catch(console.error);
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

  const badgeCls   = STATUS_BADGE[campaign?.status ?? ''] ?? 'bg-gray-100 text-gray-500';
  const tasksTotal = tasks.length;
  const tasksDone  = tasks.filter(t => t.status === 'completed').length;
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
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {campaign?.name ?? '—'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {campaign?.campaignTypeLabel}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${badgeCls}`}>
            {campaign?.statusLabel}
          </span>
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
          <Button variant="primary" startIcon={<Plus size={16} />} onClick={() => setShowAddTask(true)}>
            {isAr ? 'مهمة جديدة' : 'New Task'}
          </Button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' ? (
        tasksLoading ? (
          <div className="flex gap-4">
            {KANBAN_COLS.map(s => (
              <div key={s} className="flex-1 min-w-62.5 h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLS.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasks.filter(t => t.status === status)}
                isAr={isAr}
                onDrop={handleDrop}
                onOpen={t => setSelectedTaskId(t.id)}
              />
            ))}
          </div>
        )
      ) : activeTab === 'messages' ? (
        <ProjectMessages projectId={id} isAr={isAr} />
      ) : activeTab === 'team' ? (
        <SeoProjectTeamTab projectId={id} isAr={isAr} />
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

      {/* Add Task Modal */}
      <AddSeoTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        campaignId={id}
        prefillUrl={campaign?.targetDomain ?? ''}
        isAr={isAr}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}
