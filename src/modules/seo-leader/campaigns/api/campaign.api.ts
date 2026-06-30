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
    return http.patch<ApiResponse<SeoTaskDetail>>(
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
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments`, fd
    );
  },
};
