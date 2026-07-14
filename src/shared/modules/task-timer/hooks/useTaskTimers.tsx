import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
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

interface TaskTimersState {
  timers:      Map<string, TimerEntry>;
  getTimer:    (taskId: string) => TimerEntry | undefined;
  startTimer:  (args: StartArgs) => Promise<void>;
  pauseTimer:  (taskId: string) => Promise<void>;
  resumeTimer: (taskId: string) => Promise<void>;
  stopTimer:   (taskId: string) => Promise<void>;
}

const TaskTimersContext = createContext<TaskTimersState | null>(null);

function apiFor(portal: TimerPortal) {
  return portal === 'seo' ? seoTaskTimerApi : pmTaskTimerApi;
}

function toEntry(
  raw: TaskTimeLog,
  meta: { taskId: string; projectId: string; portal: TimerPortal; title: string },
): TimerEntry {
  return { ...raw, ...meta, syncedAt: Date.now() };
}

export function TaskTimersProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Map<string, TimerEntry>>(new Map());
  const timersRef = useRef(timers);
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  function putTimer(taskId: string, entry: TimerEntry | null) {
    setTimers((prev) => {
      const next = new Map(prev);
      if (entry) next.set(taskId, entry);
      else next.delete(taskId);
      return next;
    });
  }

  const getTimer = useCallback(
    (taskId: string) => timersRef.current.get(taskId),
    [],
  );

  const startTimer = useCallback(async ({ portal, projectId, taskId, title }: StartArgs) => {
    try {
      const raw = await apiFor(portal).start(projectId, taskId);
      putTimer(taskId, toEntry(raw, { taskId, projectId, portal, title }));
    } catch {
      toast.error('Failed to start timer');
    }
  }, []);

  const pauseTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      const raw = await apiFor(entry.portal).pause(entry.projectId, taskId, entry.id);
      putTimer(taskId, toEntry(raw, entry));
    } catch {
      toast.error('Failed to pause timer');
    }
  }, []);

  const resumeTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      const raw = await apiFor(entry.portal).resume(entry.projectId, taskId, entry.id);
      putTimer(taskId, toEntry(raw, entry));
    } catch {
      toast.error('Failed to resume timer');
    }
  }, []);

  const stopTimer = useCallback(async (taskId: string) => {
    const entry = timersRef.current.get(taskId);
    if (!entry) return;
    try {
      await apiFor(entry.portal).stop(entry.projectId, taskId, entry.id);
      putTimer(taskId, null);
    } catch {
      toast.error('Failed to stop timer');
    }
  }, []);

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
