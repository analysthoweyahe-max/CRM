import { http }                    from '@/shared/services/http.service';
import type { ApiResponse }         from '@/shared/types/api.types';
import type {
  CreateCampaignPayload,
  CampaignLookupResponse,
} from '../types/campaign.types';
import type { SeoCampaign }          from '../../dashboard/types/dashboard.types';
import type { CreateSeoTaskPayload } from '../components/AddSeoTaskModal.types';
import type { SeoTaskDetail }        from '../components/SeoTaskModal.types';

export interface SeoTaskAssignee {
  id:      string;
  name:    string;
  avatar?: string;
}

export interface SeoTask {
  id:            number;
  taskNumber:    number;
  phase:         string;
  title:         string;
  description?:  string;
  taskType:      string;
  taskTypeLabel: string;
  status:        string;
  statusLabel?:  string;
  priority:      string;
  priorityLabel?: string;
  dueDate?:      string | null;
  startDate?:    string | null;
  assignees:     SeoTaskAssignee[];
  attachments:   { id: number; name: string; url?: string }[];
  createdAt:     string;
  updatedAt:     string;
}

interface PhasedTasksResponse {
  phases: { phase: string; tasks: SeoTask[] }[];
  total:  number;
}

export interface SeoMessageSender {
  id:      string;
  name:    string;
  avatar?: string | null;
}

export interface SeoMessage {
  id:        number;
  content:   string;
  sender:    SeoMessageSender;
  isRead:    boolean;
  createdAt: string;
}

export interface Mentionable {
  id:   string;
  name: string;
}

export interface SeoComment {
  id:          number;
  body:        string;
  type?:       string;
  sender:      { id: string; name: string; type?: string; avatarUrl?: string | null };
  mentions?:   unknown[];
  attachments?: unknown[];
  sentAt:      string;
}

export const campaignApi = {
  /* ── Campaign ──────────────────────────────────────────────────────── */
  create(payload: CreateCampaignPayload) {
    return http.post<ApiResponse<{ id: number }>>('/v1/seo/projects', payload);
  },

  getById(id: string | number) {
    return http.get<ApiResponse<SeoCampaign>>(`/v1/seo/projects/${id}`);
  },

  getCampaignTypes() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/campaign-types');
  },

  getStatuses() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/statuses');
  },

  /* ── Tasks ─────────────────────────────────────────────────────────── */
  getTasks(projectId: string | number, params?: { status?: string; search?: string }) {
    return http.get<ApiResponse<PhasedTasksResponse>>(
      `/v1/seo/projects/${projectId}/tasks`, { params }
    );
  },

  getTask(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}`
    );
  },

  createTask(projectId: string | number, payload: CreateSeoTaskPayload) {
    return http.post<ApiResponse<SeoTask>>(
      `/v1/seo/projects/${projectId}/tasks`, payload
    );
  },

  updateTask(projectId: string | number, taskId: string | number, payload: Partial<CreateSeoTaskPayload>) {
    console.log('[updateTask] payload:', JSON.stringify(payload, null, 2));
    return http.put<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}`, payload
    );
  },

  updateTaskStatus(projectId: string | number, taskId: string | number, status: string) {
    return http.patch<ApiResponse<{ status: string }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/status`, { status }
    );
  },

  updateAssignees(projectId: string | number, taskId: string | number, assigneeIds: string[]) {
    return http.patch<ApiResponse<unknown>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/assignees`, { assignees: assigneeIds }
    );
  },

  uploadAttachment(projectId: string | number, taskId: string | number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return http.post<ApiResponse<{ id: number; name: string; url: string }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments`, fd,
      { headers: { 'Content-Type': undefined } }
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
      `/v1/seo/projects/${projectId}/messages`, { message: content }
    );
  },

  sendMedia(projectId: string | number, file: File) {
    const fd = new FormData();
    fd.append('attachment', file);
    return http.post<ApiResponse<SeoMessage>>(
      `/v1/seo/projects/${projectId}/messages`, fd,
      { headers: { 'Content-Type': undefined } }
    );
  },

  getMentionables(projectId: string | number) {
    return http.get<ApiResponse<{ data: Mentionable[] }>>(
      `/v1/seo/projects/${projectId}/messages/mentionables`
    );
  },

  /* ── Task Comments ─────────────────────────────────────────────────── */
  getComments(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoComment[] | { data: SeoComment[] }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`
    );
  },

  addComment(projectId: string | number, taskId: string | number, body: string) {
    return http.post<ApiResponse<{ comment: SeoComment }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`, { body }
    );
  },
};
