import { http } from '@/shared/services/http.service';
import { getAvatarColor } from '@/shared/utils/avatar.utils';
import type { TaskDetail, TaskComment, TaskSession, UpdateTaskPayload } from '../types/taskDetail.types';
import type { EmpTaskStatus, EmpTaskPriority } from '../types/employeeTask.types';

/* ── Raw backend shape — GET /v1/pm/projects/{project_id}/tasks/{task_id} ──
   Same task resource confirmed for GET /v1/pm/projects/{id}/tasks. */
interface RawPmTaskDetail {
  id:             number;
  title:          string;
  description:    string | null;
  status:         string;
  priority:       string;
  dueDate:        string | null;
  estimatedHours: string | number | null;
  phase:          { id: number; name: string } | null;
  project?:       { id: number; name: string } | null;
  createdAt:      string | null;
}

/** GET .../tasks/{task_id} wraps the task under a `task` key (alongside sibling `tabs` data). */
interface RawTaskDetailResponse {
  status:  string;
  message: string;
  data:    { task: RawPmTaskDetail };
}

/** PATCH .../tasks/{task_id} and .../status return the task fields directly under `data`. */
interface RawTaskMutationResponse {
  status:  string;
  message: string;
  data:    RawPmTaskDetail;
}

const STATUS_MAP: Record<string, EmpTaskStatus> = {
  pending:     'pending',
  in_progress: 'inProgress',
  completed:   'completed',
};

const REVERSE_STATUS_MAP: Record<EmpTaskStatus, string> = {
  pending:    'pending',
  inProgress: 'in_progress',
  completed:  'completed',
};

const PRIORITY_MAP: Record<string, EmpTaskPriority> = {
  low:    'low',
  normal: 'medium',
  high:   'high',
};

const REVERSE_PRIORITY_MAP: Record<EmpTaskPriority, string> = {
  low:    'low',
  medium: 'normal',
  high:   'high',
};

function toTaskDetail(raw: RawPmTaskDetail, projectId: string): TaskDetail {
  return {
    id:             String(raw.id),
    projectId,
    title:          raw.title,
    description:    raw.description ?? '',
    project:        raw.project?.name ?? '',
    stage:          raw.phase?.name ?? null,
    createdAt:      raw.createdAt,
    deadline:       raw.dueDate ?? '',
    priority:       PRIORITY_MAP[raw.priority] ?? 'medium',
    status:         STATUS_MAP[raw.status]     ?? 'pending',
    allocatedHours: Number(raw.estimatedHours ?? 0),
  };
}

/* ── Raw backend shape — .../tasks/{task_id}/time-logs ───────────────────── */
interface RawTimeLog {
  id:            number;
  workDate:      string;
  startedAt:     string;
  endedAt:       string;
  durationHours: number;
  notes:         string | null;
  employee:      { id: string; name: string };
  createdAt:     string;
}

interface RawTimeLogListResponse {
  status:  string;
  message: string;
  data: {
    sessions: RawTimeLog[];
    totalHours:      number;
    estimatedHours:  number | null;
    remainingHours:  number;
    progressPercent: number;
  };
}

interface RawTimeLogCreateResponse {
  status:  string;
  message: string;
  data:    RawTimeLog;
}

function toSession(raw: RawTimeLog): TaskSession {
  return {
    id:            String(raw.id),
    date:          raw.workDate,
    from:          raw.startedAt,
    to:            raw.endedAt,
    durationHours: raw.durationHours,
  };
}

/* ── Raw backend shape — .../tasks/{task_id}/comments ───────────────────── */
interface RawCommentSender {
  id:            string;
  name:          string;
  type:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

interface RawComment {
  id:     number;
  body:   string;
  sender: RawCommentSender;
  sentAt: string;
}

interface RawCommentListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawComment[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

interface RawCommentCreateResponse {
  status:  string;
  message: string;
  data:    RawComment;
}

function toComment(raw: RawComment, currentUserId: string | undefined): TaskComment {
  return {
    id:        String(raw.id),
    authorAr:  raw.sender.name,
    authorEn:  raw.sender.name,
    initials:  raw.sender.avatarInitial,
    avatarBg:  getAvatarColor(raw.sender.name),
    body:      raw.body,
    createdAt: raw.sentAt,
    isMine:    !!currentUserId && raw.sender.id === currentUserId,
  };
}

export const taskDetailApi = {
  async get(projectId: string, taskId: string): Promise<{ data: TaskDetail }> {
    const res = await http.get<RawTaskDetailResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}`);
    return { data: toTaskDetail(res.data.data.task, projectId) };
  },

  async updateStatus(projectId: string, taskId: string, status: EmpTaskStatus): Promise<{ data: TaskDetail }> {
    const res = await http.patch<RawTaskMutationResponse>(
      `/v1/pm/projects/${projectId}/tasks/${taskId}/status`,
      { status: REVERSE_STATUS_MAP[status] },
    );
    return { data: toTaskDetail(res.data.data, projectId) };
  },

  async update(projectId: string, taskId: string, payload: UpdateTaskPayload): Promise<{ data: TaskDetail }> {
    const res = await http.patch<RawTaskMutationResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}`, {
      title:           payload.title,
      description:     payload.description,
      priority:        REVERSE_PRIORITY_MAP[payload.priority],
      due_date:        payload.deadline,
      estimated_hours: payload.allocatedHours,
    });
    return { data: toTaskDetail(res.data.data, projectId) };
  },

  async getComments(projectId: string, taskId: string, currentUserId: string | undefined): Promise<{ data: TaskComment[] }> {
    const res = await http.get<RawCommentListResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/comments`);
    return { data: res.data.data.data.map(c => toComment(c, currentUserId)) };
  },

  async createComment(
    projectId: string, taskId: string, body: string, currentUserId: string | undefined,
  ): Promise<{ data: TaskComment }> {
    const res = await http.post<RawCommentCreateResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/comments`, { body });
    return { data: toComment(res.data.data, currentUserId) };
  },

  async getSessions(projectId: string, taskId: string): Promise<{ data: TaskSession[] }> {
    const res = await http.get<RawTimeLogListResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/time-logs`);
    return { data: res.data.data.sessions.map(toSession) };
  },

  async createSession(
    projectId: string, taskId: string,
    payload: { workDate: string; startedAt: string; endedAt: string; notes?: string },
  ): Promise<{ data: TaskSession }> {
    const res = await http.post<RawTimeLogCreateResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/time-logs`, {
      work_date:  payload.workDate,
      started_at: payload.startedAt,
      ended_at:   payload.endedAt,
      notes:      payload.notes,
    });
    return { data: toSession(res.data.data) };
  },

  async deleteSession(projectId: string, taskId: string, sessionId: string): Promise<void> {
    await http.delete(`/v1/pm/projects/${projectId}/tasks/${taskId}/time-logs/${sessionId}`);
  },
};
