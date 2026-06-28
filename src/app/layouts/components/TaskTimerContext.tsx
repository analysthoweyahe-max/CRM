import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { EmpTask } from '@/modules/employee/dashboard/types/empTask.types';

interface TaskTimerState {
  activeTask: EmpTask | null;
  elapsed:    number;
  isRunning:  boolean;
  startTimer: (task: EmpTask) => void;
  stopTimer:  (onDone?: () => void) => void;
}

const TaskTimerContext = createContext<TaskTimerState | null>(null);

function secondsSince(startMs: number): number {
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
}

export function TaskTimerProvider({ children }: { children: ReactNode }) {
  const [activeTask, setActiveTask] = useState<EmpTask | null>(null);
  const [startMs,    setStartMs]    = useState<number | null>(null);
  const [elapsed,    setElapsed]    = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (startMs !== null) {
      setElapsed(secondsSince(startMs));
      intervalRef.current = setInterval(() => setElapsed(secondsSince(startMs!)), 1000);
    } else {
      setElapsed(0);
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startMs]);

  function startTimer(task: EmpTask) {
    setActiveTask(task);
    setStartMs(Date.now());
  }

  function stopTimer(onDone?: () => void) {
    setActiveTask(null);
    setStartMs(null);
    onDone?.();
  }

  return (
    <TaskTimerContext.Provider value={{ activeTask, elapsed, isRunning: !!activeTask, startTimer, stopTimer }}>
      {children}
    </TaskTimerContext.Provider>
  );
}

export function useTaskTimer(): TaskTimerState {
  const ctx = useContext(TaskTimerContext);
  if (!ctx) throw new Error('useTaskTimer must be used inside <TaskTimerProvider>');
  return ctx;
}
