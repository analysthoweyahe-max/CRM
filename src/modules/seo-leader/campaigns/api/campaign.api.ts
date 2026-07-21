import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import { env } from '@/app/config/env';
import { TOKEN_KEY } from '@/app/config/constants';
import type {
  CreateCampaignPayload,
  CampaignLookupResponse,
  CampaignLookupItem,
} from '../types/campaign.types';
import type { SeoCampaign } from '../../dashboard/types/dashboard.types';
import type { ProjectActivityApiResponse } from '@/modules/project-manager/projects/types/projectActivity.types';
import type { CreateSeoTaskPayload } from '../components/AddSeoTaskModal.types';
import type { SeoTaskDetail } from '../components/SeoTaskModal.types';
import { appendSeoTaskFiles, normalizeSeoAttachments, type SeoTaskAttachment } from '@/shared/utils/seoTaskAttachment.utils';
import { appendImportantLinks, parseImportantLinks } from '@/shared/utils/importantLinks.utils';
import type { ExtendDeadlinePayload } from '@/shared/components/form/ExtendDeadlineModal';

/** Unwraps a lookup payload regardless of nesting depth — confirmed the real
 *  backend wraps task-priorities as `{ data: { data: [...], total } }` (one
 *  level deeper than `{ data: [...] }`), and task-statuses is unverified so
 *  may do the same. Falls back to [] instead of crashing on `.map`. */
function unwrapLookupArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const inner = (value as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

/** Shape from GET /v1/seo/task-statuses (and legacy lookups). Prefer `id`. */
export interface SeoTaskStatusLookupItem {
  id?: number | string;
  key?: string;
  value?: string;
  label?: string;
  labelAr?: string;
  labelEn?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
  marksCompleted?: boolean;
}

export interface SeoTaskAssignee {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  avatarInitial?: string;
}

export interface SeoTask {
  id: number;
  uuid?: string;
  taskNumber: number;
  phase: string | null;
  phaseId?: number | null;
  title: string;
  description?: string | null;
  taskType: string;
  taskTypeLabel: string;
  statusId?: number | null;
  status: string;
  statusLabel?: string;
  priority: string;
  priorityLabel?: string;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | string | null;
  estimatedMinutes?: number | string | null;
  siteLinks: string[];
  notes?: string | null;
  referenceLinks: string[];
  importantLinks?: string[];
  assignees: SeoTaskAssignee[];
  attachments: SeoTaskAttachment[];
  attachmentsCount?: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string } | null;
  created_by?: { id: string; name: string } | null;
  dueAt?: string | null;
  isOverdue?: boolean;
  isDelayed?: boolean;
  overdueLabel?: string | null;
  canExtend?: boolean;
}

export interface SeoTaskPhaseGroup {
  phase: string;
  phaseId?: number | null;
  tasks: SeoTask[];
}

export interface PhasedTasksResponse {
  phases: SeoTaskPhaseGroup[];
  columns?: { status: string; statusLabel?: string; tasks: SeoTask[] }[];
  total: number;
}

export interface SeoProjectPhase {
  id: number;
  uuid: string;
  name: string;
  sortOrder: number;
  description?: string | null;
  deliveryDate?: string | null;
  tasksCount?: number;
}

export interface SeoMessageSender {
  id: string;
  name: string;
  type?: string;
  avatarUrl?: string | null;
  avatarInitial?: string;
}

export interface SeoMessageAttachment {
  id: number;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface SeoMessage {
  id: number;
  body: string | null;
  type: string;
  sender: SeoMessageSender;
  isMine: boolean;
  mentions: unknown[];
  attachments: SeoMessageAttachment[];
  sentAt: string;
  sentTime: string;
}

export interface Mentionable {
  id: string;
  name: string;
  type?: string;
  role?: string | null;
  roles?: Array<string | { name?: string; slug?: string; role?: string }>;
}

export interface SeoComment {
  id: number;
  body: string;
  type: string;
  sender: { id: string; name: string; type: string; avatarUrl: string | null };
  mentions: unknown[];
  attachments: unknown[];
  sentAt: string;
  editedAt?: string | null;
  edited_at?: string | null;
  isEdited?: boolean;
  is_edited?: boolean;
  replies?: SeoComment[];
}

export interface SeoCommentsPage {
  data: SeoComment[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface SeoTaskTimeLog {
  id: number;
  workDate: string;
  startedAt: string;
  endedAt: string;
  durationHours: number;
  notes?: string | null;
  employee: { id: string; name: string };
  createdAt: string;
}

export interface SeoTaskTimeLogSummary {
  sessions: SeoTaskTimeLog[];
  totalHours: number;
  estimatedHours: number;
  remainingHours: number;
  progressPercent: number;
}

export interface SeoTaskUploadResponse {
  id: number;
  uuid?: string;
  title?: string;
  attachments: SeoTaskAttachment[];
  attachmentsCount: number;
}

function unwrapTaskDetail(data: unknown): SeoTaskDetail {
  const raw = data && typeof data === 'object' && 'task' in (data as object)
    ? (data as { task: SeoTaskDetail }).task
    : (data as SeoTaskDetail);
  return {
    ...raw,
    importantLinks: parseImportantLinks(raw),
    attachments: normalizeSeoAttachments(raw.attachments),
    attachmentsCount: raw.attachmentsCount ?? raw.attachments?.length ?? 0,
  };
}
export interface AddSeoTimeLogPayload {
  work_date: string;
  started_at: string;
  ended_at: string;
  notes?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SeoProjectSettings {
  id: number;
  uuid?: string;
  sectionTitle: string;
  name: string;
  startDate: string;
  expectedEndDate?: string | null;
  targetDomain: string | null;
  description: string;
  status: string;
  statusLabel: string;
  isDraft?: boolean;
  campaignType: string;
  campaignTypeLabel: string;
  /** Numeric project type id when backend provides it (for template filtering). */
  projectTypeId?: number | null;
  githubLink?: string | null;
  driveLink?: string | null;
  contractDurationMonths?: number | null;
  labels: Record<string, string>;
  statusOptions: SelectOption[];
  campaignTypeOptions: SelectOption[];
}

export interface SeoProjectUpdatePayload {
  name?: string;
  description?: string;
  targetDomain?: string | null;
  projectTypeId?: number;
  campaignType?: string;
  status_id?: number;
  startDate?: string;
  expectedEndDate?: string | null;
  githubLink?: string | null;
  driveLink?: string | null;
  contractDurationMonths?: number | null;
  isDraft?: boolean;
  targetKeywords?: string[];
  referenceLinks?: string[];
  managerIds?: string[];
  employeeIds?: string[];
}

/** PUT/PATCH /v1/seo/projects/{uuid}/tasks/{taskUuid} */
export interface SeoUpdateTaskPayload {
  title?: string;
  description?: string;
  /** String fallback when phaseId is unknown (orphan column). */
  phase?: string;
  /** Canonical phase move field for managers — preferred over `phase`. */
  phaseId?: number;
  phase_id?: number;
  taskType?: string;
  status_id?: number;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  siteLinks?: string[];
  notes?: string;
  referenceLinks?: string[];
  importantLinks?: string[];
  /* snake_case aliases still accepted by backend */
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  estimated_minutes?: number;
  site_links?: string[];
  reference_links?: string[];
  important_links?: string[];
  target_keyword?: string;
  target_url?: string;
  search_intent?: string;
  search_volume?: number;
  keyword_difficulty?: number;
  meta_title?: string;
  meta_description?: string;
}

function unwrapSeoPhaseRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.data)) return inner.data as Record<string, unknown>[];
    }
  }
  return [];
}

function normalizeSeoPhaseRecord(raw: Record<string, unknown>, index: number): SeoProjectPhase | null {
  const id = raw.id;
  if (id == null) return null;
  return {
    id: Number(id),
    uuid: String(raw.uuid ?? id),
    name: String(raw.name ?? ''),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? index),
    description: raw.description != null ? String(raw.description) : null,
    deliveryDate: raw.deliveryDate != null
      ? String(raw.deliveryDate)
      : raw.delivery_date != null
        ? String(raw.delivery_date)
        : null,
    tasksCount: raw.tasksCount != null
      ? Number(raw.tasksCount)
      : raw.tasks_count != null
        ? Number(raw.tasks_count)
        : undefined,
  };
}

function normalizeSeoProjectPhases(payload: unknown): SeoProjectPhase[] {
  return unwrapSeoPhaseRecords(payload)
    .map((item, index) => normalizeSeoPhaseRecord(item, index))
    .filter((phase): phase is SeoProjectPhase => phase != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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

  updateSettings(id: string | number, payload: SeoProjectUpdatePayload) {
    return http.put<ApiResponse<SeoProjectSettings>>(
      `/v1/seo/projects/${id}/settings`,
      payload,
    );
  },

  getActivity(id: string | number, page = 1, perPage = 20) {
    return http.get<ProjectActivityApiResponse>(
      `/v1/seo/projects/${id}/activity`,
      { params: { page, per_page: perPage } },
    );
  },

  updateProject(id: string | number, payload: SeoProjectUpdatePayload) {
    return http.put<ApiResponse<SeoCampaign>>(`/v1/seo/projects/${id}`, payload);
  },

  updateProjectStatus(id: string | number, statusId: number) {
    return http.patch<ApiResponse<SeoCampaign>>(
      `/v1/seo/projects/${id}/status`,
      { status_id: statusId },
    );
  },

  remove(id: string | number) {
    return http.delete<{ status: string; message: string }>(`/v1/seo/projects/${id}`);
  },

  getCampaignTypes() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/campaign-types');
  },

  /** Preferred SEO project-type lookup (replaces legacy campaign-types). */
  getProjectTypes() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/types');
  },

  getStatuses() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/statuses');
  },

  /** Active SEO task-status catalog — prefer /v1/seo/task-statuses (id-based). */
  getTaskStatuses() {
    return http.get<ApiResponse<SeoTaskStatusLookupItem[]>>(
      '/v1/seo/task-statuses',
      { skip401Redirect: true },
    ).then(res => ({
      ...res,
      data: { ...res.data, data: unwrapLookupArray<SeoTaskStatusLookupItem>(res.data?.data) },
    }));
  },

  getTaskPriorities() {
    return http.get<CampaignLookupResponse>(
      '/v1/seo/projects/lookups/task-priorities',
      { skip401Redirect: true },
    ).then(res => ({
      ...res,
      data: { ...res.data, data: unwrapLookupArray<CampaignLookupItem>(res.data?.data) },
    }));
  },

  /* ── Tasks (manager) ──────────────────────────────────────────────────
     Base path /v1/seo/projects/{project_id}/tasks — shared by seo-manager
     and seo-employee (guard-scoped by token, not by URL prefix). Only
     time-logs keep a separate employee/manager path (see below). */
  listAllTasks(params?: { project_id?: string | number; status?: string; search?: string; per_page?: number }) {
    return http.get<ApiResponse<PhasedTasksResponse>>('/v1/seo/manager/tasks', { params });
  },

  /** Project phases from template apply — backed by GET .../client-updates today. */
  getPhases(projectId: string | number): Promise<SeoProjectPhase[]> {
    return http.get<ApiResponse<unknown>>(
      `/v1/seo/projects/${projectId}/client-updates`,
    ).then(res => normalizeSeoProjectPhases(res.data.data));
  },

  getClientUpdates(projectId: string | number): Promise<SeoProjectPhase[]> {
    return this.getPhases(projectId);
  },

  getTasks(projectId: string | number, params?: { status?: string; search?: string; per_page?: number }) {
    return http.get<ApiResponse<PhasedTasksResponse>>(
      `/v1/seo/projects/${projectId}/tasks`, { params }
    );
  },

  /** SEO-employee-scoped project task list — `/v1/seo/manager/tasks` (used
   *  for the manager board) is manager-guarded and 403s for employee tokens,
   *  so member-facing project pages must use this route instead. */
  getEmployeeTasks(projectId: string | number, params?: { status?: string; search?: string; per_page?: number }) {
    return http.get<ApiResponse<PhasedTasksResponse>>(
      `/v1/seo/employee/projects/${projectId}/tasks`, { params }
    );
  },

  getTask(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}`,
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
      payload.employee_ids.forEach((id, i) => fd.append(`employee_ids[${i}]`, id));
      if (payload.description) fd.append('description', payload.description);
      if (payload.priority) fd.append('priority', payload.priority);
      if (payload.due_date) fd.append('due_date', payload.due_date);
      if (payload.estimated_hours != null) fd.append('estimated_hours', String(payload.estimated_hours));
      if (payload.estimated_minutes != null) fd.append('estimated_minutes', String(payload.estimated_minutes));
      if (payload.target_keyword) fd.append('target_keyword', payload.target_keyword);
      if (payload.target_url) fd.append('target_url', payload.target_url);
      appendImportantLinks(fd, payload.importantLinks);
      appendSeoTaskFiles(fd, files);
      return http.post<ApiResponse<SeoTask>>(
        `/v1/seo/projects/${projectId}/tasks`, fd,
        { headers: { 'Content-Type': undefined } },
      );
    }
    return http.post<ApiResponse<SeoTask>>(
      `/v1/seo/projects/${projectId}/tasks`, payload,
    );
  },

  updateTask(projectId: string | number, taskId: string | number, payload: SeoUpdateTaskPayload) {
    return http.put<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}`, payload
    );
  },

  updateTaskStatus(projectId: string | number, taskId: string | number, statusId: number) {
    return http.patch<ApiResponse<{ status: string }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/status`, { status_id: statusId }
    );
  },

  extendTaskDeadline(projectId: string | number, taskId: string | number, payload: ExtendDeadlinePayload) {
    return http.post<ApiResponse<SeoTaskDetail>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/extend`, payload
    );
  },

  updateAssignees(projectId: string | number, taskId: string | number, assigneeIds: string[]) {
    return http.put<ApiResponse<SeoTask>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/assignees`,
      { employee_ids: assigneeIds, employeeIds: assigneeIds },
    );
  },

  uploadAttachments(projectId: string | number, taskId: string | number, files: File[]) {
    const fd = new FormData();
    appendSeoTaskFiles(fd, files);
    return http.post<ApiResponse<SeoTaskUploadResponse>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments`, fd,
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
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
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

  /* Unified path — the /v1/seo/manager/projects/... prefix this used to hit
     is manager-guarded only and 401s (→ forced logout) for a super-admin
     token; the unified path is valid for both super-admin and the project's
     SEO manager. */
  getTimeLogs(projectId: string | number, taskId: string | number) {
    return http.get<ApiResponse<SeoTaskTimeLogSummary>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs`
    );
  },

  addTimeLog(projectId: string | number, taskId: string | number, payload: AddSeoTimeLogPayload) {
    return http.post<ApiResponse<SeoTaskTimeLog>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs`, payload
    );
  },

  deleteTimeLog(projectId: string | number, taskId: string | number, timeLogId: string | number) {
    return http.delete<ApiResponse<SeoTaskTimeLogSummary>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs/${timeLogId}`
    );
  },

  /* ── Messages ──────────────────────────────────────────────────────── */
  getMessages(projectId: string | number, params?: { search?: string }) {
    return http.get<ApiResponse<{ data: SeoMessage[]; total?: number }>>(
      `/v1/seo/projects/${projectId}/messages`, { params }
    );
  },

  sendMessage(projectId: string | number, content: string, mentions?: Array<{ type: string; id: string }>) {
    return http.post<ApiResponse<SeoMessage>>(
      `/v1/seo/projects/${projectId}/messages`,
      { body: content, ...(mentions?.length ? { mentions } : {}) },
    );
  },

  async sendMedia(projectId: string | number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    console.log('[sendMedia] file:', file.name, file.type, file.size);
    const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? '';
    const res = await fetch(
      `${env.apiBaseUrl}/v1/seo/projects/${projectId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
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
    return http.get<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`
    );
  },

  addComment(
    projectId: string | number,
    taskId: string | number,
    body: string,
    opts?: { parentId?: string | number; mentions?: Array<{ type: string; id: string }> },
  ) {
    return http.post<ApiResponse<{ comment: SeoComment }>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`,
      {
        body,
        ...(opts?.parentId != null ? { parent_id: opts.parentId } : {}),
        ...(opts?.mentions?.length ? { mentions: opts.mentions } : {}),
      },
    );
  },

  updateComment(
    projectId: string | number,
    taskId: string | number,
    commentId: string | number,
    payload: { body: string; mentions?: Array<{ type: string; id: string }> },
  ) {
    return http.put<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      {
        body: payload.body,
        ...(payload.mentions?.length ? { mentions: payload.mentions } : {}),
      },
    );
  },

  deleteComment(projectId: string | number, taskId: string | number, commentId: string | number) {
    return http.delete<ApiResponse<SeoCommentsPage>>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
  },
};
