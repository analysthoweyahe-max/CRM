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
  type?:       string;
  sender:      { id: string; name: string; type?: string; avatarUrl?: string | null };
  mentions?:   unknown[];
  attachments?: unknown[];
  sentAt:      string;
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
  labels:              Record<string, string>;
  statusOptions:       SelectOption[];
  campaignTypeOptions: SelectOption[];
}

export interface SeoProjectUpdatePayload {
  name?:         string;
  description?:  string;
  targetDomain?: string | null;
  campaignType?: string;
  startDate?:    string;
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
