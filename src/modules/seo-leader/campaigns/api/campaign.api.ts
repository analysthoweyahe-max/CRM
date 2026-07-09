import { http }                    from '@/shared/services/http.service';
import type { ApiResponse }         from '@/shared/types/api.types';
import { env }                      from '@/app/config/env';
import { TOKEN_KEY }                from '@/app/config/constants';
import type {
  CreateCampaignPayload,
  CampaignLookupResponse,
} from '../types/campaign.types';
import type { SeoCampaign }          from '../../dashboard/types/dashboard.types';
import type { CreateSeoTaskPayload } from '../components/AddSeoTaskModal.types';
import type { SeoTaskDetail }        from '../components/SeoTaskModal.types';
import { appendSeoTaskFiles, normalizeSeoAttachments, type SeoTaskAttachment } from '@/shared/utils/seoTaskAttachment.utils';

export interface SeoTaskAssignee {
  id:             string;
  name:           string;
  email?:         string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoTask {
  id:              number;
  taskNumber:      number;
  phase:           string | null;
  title:           string;
  description?:    string | null;
  taskType:        string;
  taskTypeLabel:   string;
  statusId?:       number | null;
  status:          string;
  statusLabel?:    string;
  priority:        string;
  priorityLabel?:  string;
  startDate?:      string | null;
  dueDate?:        string | null;
  estimatedHours?: number | string | null;
  siteLinks:       string[];
  notes?:          string | null;
  referenceLinks:  string[];
  assignees:       SeoTaskAssignee[];
  attachments:     SeoTaskAttachment[];
  attachmentsCount?: number;
  completedAt?:    string | null;
  createdAt:       string;
  updatedAt:       string;
}

interface PhasedTasksResponse {
  phases: { phase: string; tasks: SeoTask[] }[];
  total:  number;
}

export interface SeoMessageSender {
  id:             string;
  name:           string;
  type?:          string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoMessageAttachment {
  id:         number;
  fileName:   string;
  mimeType:   string;
  size:       number;
  url:        string;
  uploadedAt: string;
}

export interface SeoMessage {
  id:          number;
  body:        string | null;
  type:        string;
  sender:      SeoMessageSender;
  isMine:      boolean;
  mentions:    unknown[];
  attachments: SeoMessageAttachment[];
  sentAt:      string;
  sentTime:    string;
}

export interface Mentionable {
  id:   string;
  name: string;
}

export interface SeoComment {
  id:          number;
  body:        string;
  type:        string;
  sender:      { id: string; name: string; type: string; avatarUrl: string | null };
  mentions:    unknown[];
  attachments: unknown[];
  sentAt:      string;
}

export interface SeoCommentsPage {
  data:         SeoComment[];
  current_page: number;
  last_page:    number;
  total:        number;
}

export interface SeoTaskTimeLog {
  id:            number;
  workDate:      string;
  startedAt:     string;
  endedAt:       string;
  durationHours: number;
  notes?:        string | null;
  employee:      { id: string; name: string };
  createdAt:     string;
}

export interface SeoTaskTimeLogSummary {
  sessions:        SeoTaskTimeLog[];
  totalHours:      number;
  estimatedHours:  number;
  remainingHours:  number;
  progressPercent: number;
}

export interface SeoTaskUploadResponse {
  id:               number;
  uuid?:            string;
  title?:           string;
  attachments:      SeoTaskAttachment[];
  attachmentsCount: number;
}

function unwrapTaskDetail(data: unknown): SeoTaskDetail {
  const raw = data && typeof data === 'object' && 'task' in (data as object)
    ? (data as { task: SeoTaskDetail }).task
    : (data as SeoTaskDetail);
  return {
    ...raw,
    attachments: normalizeSeoAttachments(raw.attachments),
    attachmentsCount: raw.attachmentsCount ?? raw.attachments?.length ?? 0,
  };
}
export interface AddSeoTimeLogPayload {
  work_date:  string;
  started_at: string;
  ended_at:   string;
  notes?:     string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SeoProjectSettings {
  id:                  number;
  sectionTitle:        string;
  name:                string;
  startDate:           string;
  targetDomain:        string | null;
  description:         string;
  status:              string;
  statusLabel:         string;
  campaignType:        string;
  campaignTypeLabel:   string;
  githubLink?:              string | null;
  driveLink?:               string | null;
  contractDurationMonths?:  number | null;
  labels:              Record<string, string>;
  statusOptions:       SelectOption[];
  campaignTypeOptions: SelectOption[];
}

export interface SeoProjectUpdatePayload {
  name?:                    string;
  description?:             string;
  targetDomain?:            string | null;
  campaignType?:            string;
  startDate?:               string;
  githubLink?:              string | null;
  driveLink?:               string | null;
  contractDurationMonths?:  number | null;
}

export interface SeoActivityActor {
  id:             string;
  name:           string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoActivityItem {
  id:          number;
  type:        string;
  description: string;
  actor:       SeoActivityActor;
  createdAt:   string;
  timeAgo:     string;
}

export interface SeoActivityPage {
  data:        SeoActivityItem[];
  total:       number;
  currentPage: number;
  lastPage:    number;
  perPage:     number;
}

export const campaignApi = {
  /* ── Campaign ──────────────────────────────────────────────────────── */
  create(payload: CreateCampaignPayload) {
    return http.post<ApiResponse<{ id: number }>>('/v1/seo/projects', payload);
  },

  getById(id: string | number) {
    return http.get<ApiResponse<SeoCampaign>>(`/v1/seo/projects/${id}`);
  },

  getSettings(id: string | number) {
    return http.get<ApiResponse<SeoProjectSettings>>(`/v1/seo/projects/${id}/settings`);
  },

  getActivity(id: string | number, page = 1, perPage = 20) {
    return http.get<ApiResponse<SeoActivityPage>>(
      `/v1/seo/projects/${id}/activity`,
      { params: { page, per_page: perPage } },
    );
  },

  updateProject(id: string | number, payload: SeoProjectUpdatePayload) {
    /* Server returns 405 for PATCH from browser — use POST with _method spoofing */
    return http.post<ApiResponse<SeoCampaign>>(
      `/v1/seo/projects/${id}`,
      { ...payload, _method: 'PATCH' }
    );
  },

  updateProjectStatus(id: string | number, status: string) {
    return http.post<ApiResponse<SeoCampaign>>(
      `/v1/seo/projects/${id}/status`,
      { status, _method: 'PATCH' }
    );
  },

  remove(id: string | number) {
    return http.delete<{ status: string; message: string }>(`/v1/seo/projects/${id}`);
  },

  getCampaignTypes() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/campaign-types');
  },

  getStatuses() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/statuses');
  },

  /* ── Tasks (manager) ──────────────────────────────────────────────────
     Confirmed prefix: /v1/seo/manager/... — distinct from the /v1/seo/projects/...
     prefix used by the project-level (non-task) endpoints above. */
  listAllTasks(params?: { project_id?: string | number; status?: string; search?: string; per_page?: number }) {
    return http.get<ApiResponse<PhasedTasksResponse>>('/v1/seo/manager/tasks', { params });
  },

  getTasks(projectId: string | number, params?: { status?: string; search?: string }) {
    return http.get<ApiResponse<PhasedTasksResponse>>(
      `/v1/seo/manager/projects/${projectId}/tasks`, { params }
    );
  },

  getTask(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}`,
    ).then(res => ({
      ...res,
      data: {
        ...res.data,
        data: unwrapTaskDetail(res.data.data),
      },
    }));
  },

  createTask(projectId: string | number, payload: CreateSeoTaskPayload, files?: File[]) {
    if (files?.length) {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('phase', payload.phase);
      payload.employee_ids.forEach(id => fd.append('employee_ids[]', id));
      if (payload.description)      fd.append('description', payload.description);
      if (payload.priority)         fd.append('priority', payload.priority);
      if (payload.due_date)         fd.append('due_date', payload.due_date);
      if (payload.estimated_hours != null) fd.append('estimated_hours', String(payload.estimated_hours));
      if (payload.target_keyword)   fd.append('target_keyword', payload.target_keyword);
      if (payload.target_url)       fd.append('target_url', payload.target_url);
      appendSeoTaskFiles(fd, files);
      return http.post<ApiResponse<SeoTask>>(
        `/v1/seo/manager/projects/${projectId}/tasks`, fd,
        { headers: { 'Content-Type': undefined } },
      );
    }
    return http.post<ApiResponse<SeoTask>>(
      `/v1/seo/manager/projects/${projectId}/tasks`, payload,
    );
  },

  updateTask(projectId: string | number, taskId: string | number, payload: Partial<CreateSeoTaskPayload>) {
    return http.put<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}`, payload
    );
  },

  updateTaskStatus(projectId: string | number, taskId: string | number, status: string) {
    return http.patch<ApiResponse<{ status: string }>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/status`, { status }
    );
  },

  updateAssignees(projectId: string | number, taskId: string | number, assigneeIds: string[]) {
    return http.put<ApiResponse<SeoTask>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/assignees`, { employee_ids: assigneeIds }
    );
  },

  uploadAttachments(projectId: string | number, taskId: string | number, files: File[]) {
    const fd = new FormData();
    appendSeoTaskFiles(fd, files);
    return http.post<ApiResponse<SeoTaskUploadResponse>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/attachments`, fd,
      { headers: { 'Content-Type': undefined } },
    ).then(res => ({
      ...res,
      data: {
        ...res.data,
        data: {
          ...res.data.data,
          attachments: normalizeSeoAttachments(res.data.data.attachments),
        },
      },
    }));
  },

  /** @deprecated Use uploadAttachments — sends a single file via files[] */
  uploadAttachment(projectId: string | number, taskId: string | number, file: File) {
    return this.uploadAttachments(projectId, taskId, [file]);
  },

  deleteAttachment(projectId: string | number, taskId: string | number, attachmentId: string | number) {
    return http.delete<ApiResponse<SeoTaskUploadResponse>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
    ).then(res => ({
      ...res,
      data: {
        ...res.data,
        data: res.data.data ? {
          ...res.data.data,
          attachments: normalizeSeoAttachments(res.data.data.attachments),
        } : res.data.data,
      },
    }));
  },

  getTimeLogs(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoTaskTimeLogSummary>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/time-logs`
    );
  },

  addTimeLog(projectId: string | number, taskId: string | number, payload: AddSeoTimeLogPayload) {
    return http.post<ApiResponse<SeoTaskTimeLog>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/time-logs`, payload
    );
  },

  deleteTimeLog(projectId: string | number, taskId: string | number, timeLogId: string | number) {
    return http.delete<ApiResponse<SeoTaskTimeLogSummary>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/time-logs/${timeLogId}`
    );
  },

  /* ── Messages ──────────────────────────────────────────────────────── */
  getMessages(projectId: string | number, params?: { search?: string }) {
    return http.get<ApiResponse<{ data: SeoMessage[]; total?: number }>>(
      `/v1/seo/projects/${projectId}/messages`, { params }
    );
  },

  sendMessage(projectId: string | number, content: string) {
    return http.post<ApiResponse<SeoMessage>>(
      `/v1/seo/projects/${projectId}/messages`, { body: content }
    );
  },

  async sendMedia(projectId: string | number, file: File) {
    const fd    = new FormData();
    fd.append('file', file);
    console.log('[sendMedia] file:', file.name, file.type, file.size);
    const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? '';
    const res   = await fetch(
      `${env.apiBaseUrl}/v1/seo/projects/${projectId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        'application/json',
          /* No Content-Type — browser sets multipart/form-data + boundary automatically */
        },
        body: fd,
      },
    );
    const json: ApiResponse<SeoMessage> = await res.json();
    if (!res.ok) throw { response: { data: json, status: res.status } };
    return { data: json };
  },

  getMentionables(projectId: string | number) {
    return http.get<ApiResponse<{ data: Mentionable[] }>>(
      `/v1/seo/projects/${projectId}/messages/mentionables`
    );
  },

  /* ── Task Comments (manager) ──────────────────────────────────────────── */
  getComments(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/comments`
    );
  },

  addComment(projectId: string | number, taskId: string | number, body: string) {
    return http.post<ApiResponse<{ comment: SeoComment }>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/comments`, { body }
    );
  },

  updateComment(projectId: string | number, taskId: string | number, commentId: string | number, body: string) {
    return http.put<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, { body }
    );
  },

  deleteComment(projectId: string | number, taskId: string | number, commentId: string | number) {
    return http.delete<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
  },
};
