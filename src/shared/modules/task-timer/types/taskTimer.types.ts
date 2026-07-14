/** Which base-path family a task's time-log endpoints live under. */
export type TimerPortal = 'pm' | 'seo';

export interface TaskTimeLog {
  id:                     string;
  isRunning:              boolean;
  isPaused:               boolean;
  isOpen:                 boolean;
  canPause:               boolean;
  canResume:              boolean;
  canStop:                boolean;
  elapsedSeconds:         number;
  durationHours:          number;
  pausedAt:               string | null;
  allowsConcurrentTimers?: boolean;
}
