import { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TimerControls } from '@/shared/modules/task-timer/components/TimerControls';
import type { TimerPortal } from '@/shared/modules/task-timer/types/taskTimer.types';
import { formatTimeLogClock, formatTimeLogDate } from '@/shared/utils/timeLog.utils';
import { useCreateSession, useDeleteSession } from '../hooks/useTaskDetail';
import type { TaskDetail, TaskSession, TaskTimeLogSummary } from '../types/taskDetail.types';

interface CreateSessionPayload { workDate: string; startedAt: string; endedAt: string }

interface Props {
  task:       TaskDetail | undefined;
  sessions:   TaskSession[];
  isLoading:  boolean;
  isAr:       boolean;
  projectId?: string;
  taskId?:    string;
  onCreateSession?: (payload: CreateSessionPayload, opts: { onSuccess: () => void }) => void;
  onDeleteSession?: (sessionId: string) => void;
  creatingSession?: boolean;
  deletingSession?: boolean;
  /** Which time-log endpoint family the live timer should call — defaults to PM. */
  portal?: TimerPortal;
  /**
   * Prefer API time-log summary when available (total / estimated / remaining / progress).
   * Falls back to summing sessions + task.allocatedHours.
   */
  summary?: Pick<TaskTimeLogSummary, 'totalHours' | 'estimatedHours' | 'remainingHours' | 'progressPercent'> | null;
}

interface AddSessionForm {
  date: string;
  from: string;
  to:   string;
}

function calcDuration(from: string, to: string): number {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const diff = (th * 60 + tm) - (fh * 60 + fm);
  return Math.max(0, Math.round((diff / 60) * 10) / 10);
}

function formatHours(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between gap-4">
        <div className="h-9 w-28 bg-brand-100 dark:bg-brand-900/30 rounded-lg" />
        <div className="space-y-1 text-end">
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded ms-auto" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded" />)}
      </div>
    </div>
  );
}

export function TaskDetailTimeTracker({
  task, sessions: serverSessions, isLoading, isAr, projectId, taskId,
  onCreateSession, onDeleteSession, creatingSession, deletingSession,
  portal = 'pm',
  summary,
}: Props) {
  const canPersist = !!(projectId && taskId);
  const pmCreateSessionMutation = useCreateSession(projectId ?? '', taskId ?? '');
  const pmDeleteSessionMutation = useDeleteSession(projectId ?? '', taskId ?? '');
  const persistCreate = onCreateSession ?? ((payload, opts) => pmCreateSessionMutation.mutate(payload, opts));
  const persistDelete = onDeleteSession ?? ((id: string) => pmDeleteSessionMutation.mutate(id));
  const isCreatingSession = onCreateSession ? !!creatingSession : pmCreateSessionMutation.isPending;
  const isDeletingSession = onDeleteSession ? !!deletingSession : pmDeleteSessionMutation.isPending;

  const [localSessions, setLocalSessions] = useState<TaskSession[]>(serverSessions);
  const sessions = canPersist ? serverSessions : localSessions;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<AddSessionForm>({ date: '', from: '', to: '' });

  if (isLoading || !task) return <Skeleton />;

  const summed = sessions.reduce((s, r) => s + (Number(r.durationHours) || 0), 0);
  // Prefer API summary, but never let a zero estimatedHours override a real allocatedHours.
  const estimated = Number(summary?.estimatedHours) || Number(task.allocatedHours) || 0;
  const consumed = Math.max(Number(summary?.totalHours) || 0, summed);
  const remaining = estimated > 0
    ? Math.max(0, Math.round((estimated - consumed) * 100) / 100)
    : Math.max(0, Number(summary?.remainingHours) || 0);
  const progressPct = estimated > 0
    ? Math.min(100, Math.round((consumed / estimated) * 1000) / 10)
    : Math.min(100, Math.max(0, Number(summary?.progressPercent) || 0));

  function deleteSession(id: string) {
    if (canPersist) { persistDelete(id); return; }
    setLocalSessions(prev => prev.filter(s => s.id !== id));
  }

  function handleAddSession() {
    const duration = calcDuration(form.from, form.to);
    if (!form.date || !form.from || !form.to || duration <= 0) return;

    if (canPersist) {
      persistCreate(
        { workDate: form.date, startedAt: form.from, endedAt: form.to },
        { onSuccess: () => { setForm({ date: '', from: '', to: '' }); setShowModal(false); } },
      );
      return;
    }

    const newSession: TaskSession = {
      id:            Date.now().toString(),
      date:          form.date,
      from:          form.from,
      to:            form.to,
      durationHours: duration,
    };
    setLocalSessions(prev => [...prev, newSession]);
    setForm({ date: '', from: '', to: '' });
    setShowModal(false);
  }

  const duration = calcDuration(form.from, form.to);

  return (
    <div className="space-y-5">
      {canPersist && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between gap-4">
          <TimerControls portal={portal} projectId={projectId!} taskId={taskId!} title={task.title} isAr={isAr} size="md" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
          >
            <Plus size={14} />
            {isAr ? 'إضافة جلسة يدوياً' : 'Add Session Manually'}
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'الجلسات المسجلة' : 'Recorded Sessions'}
          </p>
        </div>

        {sessions.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            {isAr ? 'لا توجد جلسات مسجلة' : 'No recorded sessions'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="flex items-center justify-between gap-4 px-1 pb-2 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-8">
                  <span>{isAr ? 'التاريخ' : 'Date'}</span>
                  <span>{isAr ? 'من' : 'From'}</span>
                  <span>{isAr ? 'إلى' : 'To'}</span>
                </div>
                <div className="flex items-center gap-5">
                  <span>{isAr ? 'المدة' : 'Duration'}</span>
                  <span className="w-3.5" />
                </div>
              </div>

              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-4 px-1 py-3 border-b border-gray-100 dark:border-gray-700 text-sm">
                  <div className="flex items-center gap-8 text-gray-700 dark:text-gray-300">
                    <span className="tabular-nums">{formatTimeLogDate(s.date, isAr)}</span>
                    <span className="tabular-nums">{formatTimeLogClock(s.from, isAr)}</span>
                    <span className="tabular-nums">{formatTimeLogClock(s.to, isAr)}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-brand-500 font-medium tabular-nums">{formatHours(s.durationHours)} {isAr ? 'س' : 'h'}</span>
                    <button
                      onClick={() => deleteSession(s.id)}
                      disabled={isDeletingSession}
                      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-800 dark:text-gray-100">{formatHours(consumed)} {isAr ? 'ساعة' : 'hours'}</span>
            <span className="text-gray-500 dark:text-gray-400">{isAr ? 'إجمالي الوقت المستهلك' : 'Total Time Consumed'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{formatHours(remaining)} {isAr ? 'ساعة' : 'hours'}</span>
              <span className="text-gray-400 text-xs ms-1">({isAr ? 'من' : 'of'} {formatHours(estimated)} {isAr ? 'ساعة' : 'h'})</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">{isAr ? 'الوقت المتبقي' : 'Remaining Time'}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                {isAr ? 'إضافة جلسة يدوياً' : 'Add Session Manually'}
              </h3>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                {isAr ? 'التاريخ' : 'Date'}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  {isAr ? 'من' : 'From'}
                </label>
                <input
                  type="time"
                  value={form.from}
                  onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  {isAr ? 'إلى' : 'To'}
                </label>
                <input
                  type="time"
                  value={form.to}
                  onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            {duration > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                {isAr ? `المدة المحسوبة: ${duration} ساعة` : `Calculated duration: ${duration} h`}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAddSession}
                disabled={!form.date || !form.from || !form.to || duration <= 0 || isCreatingSession}
              >
                {isAr ? 'إضافة' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
