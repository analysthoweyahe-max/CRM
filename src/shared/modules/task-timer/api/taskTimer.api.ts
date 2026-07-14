import { http } from '@/shared/services/http.service';
import type { TaskTimeLog } from '../types/taskTimer.types';

interface RawTaskTimeLog {
  id:                     string | number;
  isRunning?:             boolean;
  isPaused?:              boolean;
  isOpen?:                boolean;
  canPause?:              boolean;
  canResume?:             boolean;
  canStop?:               boolean;
  elapsedSeconds?:        number;
  durationHours?:         number;
  pausedAt?:              string | null;
  allowsConcurrentTimers?: boolean;
}

interface TaskTimeLogResponse {
  status:  string;
  message: string;
  data:    RawTaskTimeLog;
}

function toTaskTimeLog(raw: RawTaskTimeLog): TaskTimeLog {
  const isPaused  = Boolean(raw.isPaused);
  const isRunning = Boolean(raw.isRunning);
  const isOpen    = Boolean(raw.isOpen ?? raw.isRunning ?? true);

  // Prefer explicit capability flags from the API; fall back to isPaused so the
  // Pause ↔ Resume toggle still works if the backend omits canPause/canResume.
  const canPause  = raw.canPause  != null ? Boolean(raw.canPause)  : isOpen && !isPaused;
  const canResume = raw.canResume != null ? Boolean(raw.canResume) : isOpen && isPaused;
  const canStop   = raw.canStop   != null ? Boolean(raw.canStop)   : isOpen;

  return {
    id:                     String(raw.id),
    isRunning,
    isPaused,
    isOpen,
    canPause,
    canResume,
    canStop,
    elapsedSeconds:         raw.elapsedSeconds ?? 0,
    durationHours:          raw.durationHours ?? 0,
    pausedAt:               raw.pausedAt ?? null,
    allowsConcurrentTimers: raw.allowsConcurrentTimers,
  };
}

function createTaskTimerApi(basePath: (projectId: string, taskId: string) => string) {
  return {
    async start(projectId: string, taskId: string): Promise<TaskTimeLog> {
      const res = await http.post<TaskTimeLogResponse>(`${basePath(projectId, taskId)}/time-logs/start`);
      return toTaskTimeLog(res.data.data);
    },

    async pause(projectId: string, taskId: string, timeLogId: string): Promise<TaskTimeLog> {
      const res = await http.post<TaskTimeLogResponse>(
        `${basePath(projectId, taskId)}/time-logs/${timeLogId}/pause`,
      );
      return toTaskTimeLog(res.data.data);
    },

    async resume(projectId: string, taskId: string, timeLogId: string): Promise<TaskTimeLog> {
      const res = await http.post<TaskTimeLogResponse>(
        `${basePath(projectId, taskId)}/time-logs/${timeLogId}/resume`,
      );
      return toTaskTimeLog(res.data.data);
    },

    async stop(projectId: string, taskId: string, timeLogId: string): Promise<TaskTimeLog> {
      const res = await http.post<TaskTimeLogResponse>(
        `${basePath(projectId, taskId)}/time-logs/${timeLogId}/stop`,
      );
      return toTaskTimeLog(res.data.data);
    },
  };
}

/** Employee + PM tasks share the /v1/pm/projects/{project}/tasks/{task} resource. */
export const pmTaskTimerApi = createTaskTimerApi(
  (projectId, taskId) => `/v1/pm/projects/${projectId}/tasks/${taskId}`,
);

/** SEO-member + SEO-leader tasks share the /v1/seo/projects/{project}/tasks/{task} resource. */
export const seoTaskTimerApi = createTaskTimerApi(
  (projectId, taskId) => `/v1/seo/projects/${projectId}/tasks/${taskId}`,
);
