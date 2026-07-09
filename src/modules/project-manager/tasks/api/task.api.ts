import { http } from '@/shared/services/http.service';

/** POST /v1/pm/projects/{id}/tasks — accepts camelCase (preferred) or snake_case. */
export interface PmCreateTaskPayload {
  title:            string;
  description?:     string;
  employeeId?:      string;
  priority?:        string;
  dueDate?:         string;
  estimatedHours?:  number;
  phaseId?:         number;
  status?:          string;
}

export interface PmCreateSelfTaskPayload {
  title:            string;
  description?:     string;
  priority?:        string;
  dueDate?:         string;
  estimatedHours?:  number;
  phaseId?:         number;
  file?:            File;
}

function buildSelfTaskFormData(payload: PmCreateSelfTaskPayload): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  if (payload.description)    fd.append('description', payload.description);
  if (payload.priority)       fd.append('priority', payload.priority);
  if (payload.dueDate)        fd.append('dueDate', payload.dueDate);
  if (payload.estimatedHours != null) fd.append('estimatedHours', String(payload.estimatedHours));
  if (payload.phaseId != null)        fd.append('phaseId', String(payload.phaseId));
  if (payload.file)           fd.append('file', payload.file);
  return fd;
}

/** PM task API stores medium priority as `normal` (see employee task list mapping). */
export function normalizePmTaskPriority(value: string): string {
  return value === 'medium' ? 'normal' : value;
}

export interface PmUpdateTaskPayload {
  title?:           string;
  priority?:        string;
  due_date?:        string;
  estimated_hours?: number;
}

export interface PmTaskApiResponse {
  success?: boolean;
  status?:  string;
  message:  string;
  data:     {
    id:         number;
    uuid?:      string;
    taskNumber?: number;
    title?:     string;
    status?:    string;
    priority?:  string;
    assignee?:  { id: string; name: string };
  };
}

export interface PmTimeLogPayload {
  work_date:  string;
  started_at: string;
  ended_at:   string;
  notes?:     string;
}

/* ── Raw backend shapes — GET /v1/pm/projects/{id}/tasks (+ /{task_id}) ──── */
export interface RawPmTaskPhase {
  id:   number;
  name: string;
}

export interface RawPmTaskAssignee {
  id:            string;
  name:          string;
  email?:        string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface RawPmTaskAttachment {
  id:         number;
  fileName?:  string;
  name?:      string;
  mimeType?:  string;
  size?:      number;
  url?:       string;
  uploadedAt?: string | null;
  uploadedBy?: { id: string; name: string } | null;
}

export interface RawPmTask {
  id:               number;
  uuid:             string;
  taskNumber:       number;
  title:            string;
  description:      string | null;
  status:           string;
  statusLabel:      string;
  priority:         string;
  priorityLabel:    string;
  dueDate:          string | null;
  estimatedHours:   string | number | null;
  phase?:           RawPmTaskPhase | null;
  assignee?:        RawPmTaskAssignee | null;
  completedAt:      string | null;
  attachments:      RawPmTaskAttachment[];
  attachmentsCount: number;
  createdAt:        string;
  updatedAt:        string;
}

export interface RawPmTaskColumn {
  status:      string;
  statusLabel: string;
  tasks:       RawPmTask[];
}

export interface PmTaskListResponse {
  status:  string;
  message: string;
  data: {
    columns: RawPmTaskColumn[];
    total:   number;
  };
}

export interface RawPmTimeLogSession {
  id:            number;
  workDate:      string;
  startedAt:     string;
  endedAt:       string;
  durationHours: number;
  notes:         string | null;
  employee:      { id: string; name: string };
  createdAt:     string;
}

export interface PmTaskDetailResponse {
  status:  string;
  message: string;
  data: {
    task: RawPmTask & { commentsCount: number };
    tabs: {
      information: boolean;
      timeTracking: {
        sessions:        RawPmTimeLogSession[];
        totalHours:      number;
        estimatedHours:  number;
        remainingHours:  number;
        progressPercent: number;
      };
      attachmentsCount: number;
      commentsCount:    number;
    };
  };
}

export interface RawPmCommentSender {
  id:            string;
  name:          string;
  type:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface RawPmComment {
  id:     number;
  body:   string;
  sender: RawPmCommentSender;
  sentAt: string;
}

export interface PmCommentListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawPmComment[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmCommentCreateResponse {
  status:  string;
  message: string;
  data:    RawPmComment;
}

export const pmTaskApi = {
  list(projectId: number | string) {
    return http.get<PmTaskListResponse>(`/v1/pm/projects/${projectId}/tasks`);
  },

  get(projectId: number | string, taskId: string) {
    return http.get<PmTaskDetailResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}`);
  },

  create(projectId: number | string, payload: PmCreateTaskPayload) {
    return http.post<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks`, payload);
  },

  /** Employee self-create — POST /v1/pm/employee/projects/{id}/tasks/self (multipart). */
  createSelf(projectId: number | string, payload: PmCreateSelfTaskPayload) {
    return http.post<PmTaskApiResponse>(
      `/v1/pm/employee/projects/${projectId}/tasks/self`,
      buildSelfTaskFormData(payload),
      { headers: { 'Content-Type': undefined } },
    );
  },

  update(projectId: number | string, taskId: string, payload: PmUpdateTaskPayload) {
    return http.put<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}`, payload);
  },

  remove(projectId: number | string, taskId: string) {
    return http.delete<{ status: string; message: string }>(`/v1/pm/projects/${projectId}/tasks/${taskId}`);
  },

  updateStatus(projectId: number | string, taskId: string, status: string) {
    return http.patch<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/status`, { status });
  },

  addTimeLog(projectId: number | string, taskId: string, payload: PmTimeLogPayload) {
    return http.post<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/time-logs`, payload);
  },

  getComments(projectId: number | string, taskId: string) {
    return http.get<PmCommentListResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/comments`);
  },

  createComment(projectId: number | string, taskId: string, body: string) {
    return http.post<PmCommentCreateResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/comments`, { body });
  },

  uploadAttachment(projectId: number | string, taskId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(`/v1/pm/projects/${projectId}/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAttachment(projectId: number | string, taskId: string, attachmentId: string) {
    return http.delete(`/v1/pm/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
  },
};
