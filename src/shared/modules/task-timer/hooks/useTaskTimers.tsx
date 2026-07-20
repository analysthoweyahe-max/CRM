import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { pauseAttendanceIfRunning } from '@/shared/modules/attendance/services/attendanceTimerBridge';
import { resolveAttendanceScope } from '@/shared/modules/attendance/utils/attendanceTimer.utils';
import type { AttendanceScope } from '@/shared/modules/attendance/types/attendanceTimer.types';
import { pmTaskTimerApi, seoTaskTimerApi } from '../api/taskTimer.api';
import type { TaskTimeLog, TimerPortal } from '../types/taskTimer.types';

export interface TimerEntry extends TaskTimeLog {
  taskId:    string;
  projectId: string;
  portal:    TimerPortal;
  title:     string;
  /** Local clock time the entry's `elapsedSeconds` was last known-accurate. */
  syncedAt:  number;
}

interface StartArgs {
  portal:    TimerPortal;
  projectId: string;
  taskId:    string;
  title:     string;
}

interface TimerMeta {
  taskId:    string;
  projectId: string;
  portal:    TimerPortal;
  title:     string;
}

interface TaskTimersState {
  timers:      Map<string, TimerEntry>;
  getTimer:    (taskId: string) => TimerEntry | undefined;
  startTimer:  (args: StartArgs) => Promise<void>;
  pauseTimer:  (taskId: string) => Promise<void>;
  resumeTimer: (taskId: string) => Promise<void>;
  stopTimer:   (taskId: string) => Promise<void>;
}

const TaskTimersContext = createContext<TaskTimersState | null>(null);

const STORAGE_PREFIX = 'hr_open_task_timers:';

function apiFor(portal: TimerPortal) {
  return portal === 'seo' ? seoTaskTimerApi : pmTaskTimerApi;
}

function storageKey(scope: AttendanceScope) {
  return `${STORAGE_PREFIX}${scope}`;
}

function persistTimers(scope: AttendanceScope, timers: Map<string, TimerEntry>) {
  try {
    const list = Array.from(timers.values());
    if (list.length === 0) {
      sessionStorage.removeItem(storageKey(scope));
      return;
    }
    sessionStorage.setItem(storageKey(scope), JSON.stringify(list));
  } catch {
    /* ignore quota / private mode */
  }
}

function loadPersistedTimers(scope: AttendanceScope): Map<string, TimerEntry> {
  try {
    const raw = sessionStorage.getItem(storageKey(scope));
    if (!raw) return new Map();
    const list = JSON.parse(raw) as TimerEntry[];
    if (!Array.isArray(list)) return new Map();
    const now = Date.now();
    const map = new Map<string, TimerEntry>();
    for (const entry of list) {
      if (!entry?.taskId || !entry?.id) continue;
      const syncedAt = typeof entry.syncedAt === 'number' ? entry.syncedAt : now;
      const driftSec = entry.isPaused ? 0 : Math.max(0, Math.floor((now - syncedAt) / 1000));
      map.set(entry.taskId, {
        ...entry,
        elapsedSeconds: (entry.elapsedSeconds ?? 0) + driftSec,
        syncedAt: now,
      });
    }
    return map;
  } catch {
    return new Map();
  }
}

/** Merge API payload with local meta — never spread a full entry over `raw` or
 *  stale `isPaused` / `canPause` / `canResume` would clobber a successful pause/resume. */
function toEntry(raw: TaskTimeLog, meta: TimerMeta): TimerEntry {
  return {
    ...raw,
    taskId:    meta.taskId,
    projectId: meta.projectId,
    portal:    meta.portal,
    title:     meta.title,
    syncedAt:  Date.now(),
  };
}

/** Elapsed seconds as of now, including time since last server/local sync. */
export function liveElapsedSeconds(entry: Pick<TimerEntry, 'elapsedSeconds' | 'isPaused' | 'syncedAt'>): number {
  const base = entry.elapsedSeconds ?? 0;
  if (entry.isPaused) return base;
  const drift = Math.max(0, Math.floor((Date.now() - entry.syncedAt) / 1000));
  return base + drift;
}

interface ProviderProps {
  children: ReactNode;
  /** Attendance scope for this portal layout — used to auto-pause work timer. */
  attendanceScope?: AttendanceScope;
  /**
   * When `true`, starting/resuming a task timer will auto-pause the work/attendance timer
   * (mutual exclusion behavior).
   */
  pauseAttendanceWhenTaskRuns?: boolean;
}

export function TaskTimersProvider({
  children,
  attendanceScope,
  pauseAttendanceWhenTaskRuns = true,
}: ProviderProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const scope = attendanceScope
    ?? resolveAttendanceScope(user?.role, user?.section);

  const [timers, setTimers] = useState<Map<string, TimerEntry>>(() => loadPersistedTimers(scope));
  const timersRef = useRef(timers);
  timersRef.current = timers;

  useEffect(() => {
    persistTimers(scope, timers);
  }, [scope, timers]);

  function putTimer(taskId: string, entry: TimerEntry | null) {
    setTimers((prev) => {
      const next = new Map(prev);
      if (entry) next.set(taskId, entry);
      else next.delete(taskId);
      return next;
    });
  }

  function replaceTimers(next: Map<string, TimerEntry>) {
    setTimers(next);
  }

  const getTimer = useCallback(
    (taskId: string) => timers.get(taskId),
    [timers],
  );

  const invalidateTaskQueries = useCallback((entry: TimerEntry, taskId: string) => {
    if (entry.portal === 'seo') {
      qc.invalidateQueries({ queryKey: ['seo-member', 'task-sessions', entry.projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['seo-task-time-logs', entry.projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'task-detail', entry.projectId, taskId] });
    } else {
      qc.invalidateQueries({ queryKey: ['task-sessions', entry.projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['task-detail', entry.projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['pm-task-detail', entry.projectId, taskId] });
    }
  }, [qc]);

  /** Stop every other open timer in the Map (best-effort) when concurrency is not allowed. */
  const stopOtherTimers = useCallback(async (keepTaskId: string) => {
    const others = Array.from(timersRef.current.values()).filter(
      (e) => e.taskId !== keepTaskId && e.isOpen,
    );
    await Promise.allSettled(
      others.map(async (entry) => {
        try {
          await apiFor(entry.portal).stop(entry.projectId, entry.taskId, entry.id);
        } catch {
          /* backend may already have closed it */
        }
        putTimer(entry.taskId, null);
        invalidateTaskQueries(entry, entry.taskId);
      }),
    );
  }, [invalidateTaskQueries]);

  const startTimer = useCallback(async ({ portal, projectId, taskId, title }: StartArgs) => {
    try {
      // Mutual exclusion with attendance: pause the work day while a task runs.
      if (pauseAttendanceWhenTaskRuns && !user?.isSuperAdmin) {
        try {
          await pauseAttendanceIfRunning(qc, scope);
        } catch {
          /* don't block task start if attendance pause fails */
        }
      }

      const raw = await apiFor(portal).start(projectId, taskId);
      const entry = toEntry(raw, { taskId, projectId, portal, title });
      // Concurrent timers are allowed unless the API explicitly forbids them.
      const forbidsConcurrent = raw.allowsConcurrentTimers === false;

      if (forbidsConcurrent) {
        // Stop sibling UI timers after a successful start so a failed start
        // doesn't wipe other running sessions.
        await stopOtherTimers(taskId);
        const next = new Map<string, TimerEntry>();
        next.set(taskId, entry);
        replaceTimers(next);
      } else {
        putTimer(taskId, entry);
      }
    } catch {
      toast.error('Failed to start timer');
    }
  }, [qc, scope, stopOtherTimers, user?.isSuperAdmin, pauseAttendanceWhenTaskRuns]);

  const pauseTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      const raw = await apiFor(entry.portal).pause(entry.projectId, taskId, entry.id);
      putTimer(taskId, toEntry(raw, {
        taskId: entry.taskId,
        projectId: entry.projectId,
        portal: entry.portal,
        title: entry.title,
      }));
    } catch {
      toast.error('Failed to pause timer');
    }
  }, []);

  const resumeTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      if (pauseAttendanceWhenTaskRuns && !user?.isSuperAdmin) {
        try {
          await pauseAttendanceIfRunning(qc, scope);
        } catch {
          /* ignore */
        }
      }
      const raw = await apiFor(entry.portal).resume(entry.projectId, taskId, entry.id);
      putTimer(taskId, toEntry(raw, {
        taskId: entry.taskId,
        projectId: entry.projectId,
        portal: entry.portal,
        title: entry.title,
      }));
    } catch {
      toast.error('Failed to resume timer');
    }
  }, [qc, scope, user?.isSuperAdmin, pauseAttendanceWhenTaskRuns]);

  const stopTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      await apiFor(entry.portal).stop(entry.projectId, taskId, entry.id);
      putTimer(taskId, null);
      invalidateTaskQueries(entry, taskId);
    } catch {
      toast.error('Failed to stop timer');
    }
  }, [invalidateTaskQueries]);

  return (
    <TaskTimersContext.Provider value={{ timers, getTimer, startTimer, pauseTimer, resumeTimer, stopTimer }}>
      {children}
    </TaskTimersContext.Provider>
  );
}

export function useTaskTimers(): TaskTimersState {
  const ctx = useContext(TaskTimersContext);
  if (!ctx) throw new Error('useTaskTimers must be used inside <TaskTimersProvider>');
  return ctx;
}
