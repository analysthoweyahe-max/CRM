import { http } from '@/shared/services/http.service';
import type { AxiosRequestConfig } from 'axios';
import { toSeoTask as mapSeoTask } from './seoTask.api';
import type { RawSeoTask, RawSeoTaskRef } from './seoTask.api';
import type { SeoTaskStatus } from '../types/seoTask.types';
import type {
  SeoTaskDetail, SeoTaskDetailResponse, SeoAssignee, SeoTaskDetailTabs,
  SeoTaskComment, SeoTaskCommentsPage,
  SeoTaskTimeLog, SeoTaskTimeLogSummary, AddTimeLogPayload,
} from '../types/seoTaskDetail.types';
import type { CreateSelfSeoTaskPayload } from '../types/seoTask.types';
import {
  appendSeoTaskFiles,
  normalizeSeoAttachments,
  type SeoTaskAttachment,
} from '@/shared/utils/seoTaskAttachment.utils';
import { appendImportantLinks, parseImportantLinks } from '@/shared/utils/importantLinks.utils';
import type { ExtendDeadlinePayload } from '@/shared/components/form/ExtendDeadlineModal';

/** Axios rejects 2xx responses when the body is empty/non-JSON. Mutation
 *  endpoints often return that shape after a successful write — tolerate it
 *  so callers don't show a false error toast. */
const IGNORE_BODY: AxiosRequestConfig = {
  transformResponse: [(data: unknown) => {
    if (data == null || data === '') return {};
    if (typeof data !== 'string') return data;
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }],
};

/** UI uses `normal`; wire/lookups commonly use `medium`. */
function toWirePriority(priority: string | undefined): string | undefined {
  if (!priority) return undefined;
  return priority === 'normal' ? 'medium' : priority;
}

function toUpdateTaskBody(payload: SeoUpdateTaskPayload) {
  return {
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.priority !== undefined ? { priority: toWirePriority(payload.priority) } : {}),
    ...(payload.dueDate !== undefined
      ? { dueDate: payload.dueDate, due_date: payload.dueDate }
      : {}),
    ...(payload.importantLinks !== undefined
      ? { importantLinks: payload.importantLinks, important_links: payload.importantLinks }
      : {}),
  };
}

interface RawSeoAssignee {
  id: string | number;
  name: string;
  initials?: string;
  avatar?: string | null;
}

interface RawSeoTaskDetail extends RawSeoTask {
  assignees?: RawSeoAssignee[];
  createdBy?: RawSeoTaskRef | null;
  startDate?: string | null;
  siteLinks?: string[];
  referenceLinks?: string[];
  importantLinks?: string[];
  important_links?: string[];
  notes?: string | null;
  targetUrl?: string | null;
  targetKeyword?: string | null;
  searchIntent?: string | null;
  searchVolume?: number | null;
  keywordDifficulty?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  allocatedHours?: number;
  estimatedHours?: number;
  estimated_hours?: number;
  allocated_hours?: number;
  attachments?: unknown[];
  attachmentsCount?: number;
}

export interface SeoUpdateTaskPayload {
  title?: string;
  priority?: string;
  dueDate?: string;
  importantLinks?: string[];
}

interface SeoTaskUploadResponse {
  id: number;
  uuid?: string;
  title?: string;
  attachments: SeoTaskAttachment[];
  attachmentsCount: number;
}

function toAssignee(raw: RawSeoAssignee): SeoAssignee {
  const name = raw.name ?? '';
  return {
    id: String(raw.id),
    name,
    initials: raw.initials ?? name.charAt(0).toUpperCase(),
    avatarBg: 'bg-brand-500',
  };
}

function toSeoTaskDetail(raw: RawSeoTaskDetail): SeoTaskDetail {
  const attachments = normalizeSeoAttachments(raw.attachments);
  return {
    ...mapSeoTask(raw),
    assignees: (raw.assignees ?? []).map(toAssignee),
    createdBy: raw.createdBy ? { id: String(raw.createdBy.id), name: raw.createdBy.name } : null,
    startDate: raw.startDate ?? null,
    siteLinks: raw.siteLinks ?? [],
    referenceLinks: raw.referenceLinks ?? [],
    importantLinks: parseImportantLinks(raw),
    notes: raw.notes ?? null,
    targetUrl: raw.targetUrl ?? null,
    targetKeyword: raw.targetKeyword ?? null,
    searchIntent: raw.searchIntent ?? null,
    searchVolume: raw.searchVolume ?? null,
    keywordDifficulty: raw.keywordDifficulty ?? null,
    metaTitle: raw.metaTitle ?? null,
    metaDescription: raw.metaDescription ?? null,
    allocatedHours: Number(
      raw.allocatedHours
      ?? raw.estimatedHours
      ?? raw.estimated_hours
      ?? raw.allocated_hours
      ?? 0,
    ),
    attachments,
    attachmentsCount: raw.attachmentsCount ?? attachments.length,
  };
}

function mapUploadResponse(data: SeoTaskUploadResponse): SeoTaskUploadResponse {
  return {
    ...data,
    attachments: normalizeSeoAttachments(data.attachments),
    attachmentsCount: data.attachmentsCount ?? normalizeSeoAttachments(data.attachments).length,
  };
}

export const seoTaskDetailApi = {
  async getById(projectId: string, taskId: string): Promise<{ task: SeoTaskDetail; tabs?: SeoTaskDetailTabs }> {
    const res = await http.get<{
      status: string;
      message: string;
      data: { task: RawSeoTaskDetail; tabs?: SeoTaskDetailTabs };
    }>(`/v1/seo/projects/${projectId}/tasks/${taskId}`);

    const task = toSeoTaskDetail(res.data.data.task);
    const tabs = res.data.data.tabs;
    return {
      task: {
        ...task,
        attachmentsCount: tabs?.attachmentsCount ?? task.attachmentsCount,
      },
      tabs,
    };
  },

  /* Doesn't parse/return the response body — the .../status endpoint's
     response shape is unconfirmed, and a mismatch there (e.g. no nested
     `task` object) previously made toSeoTaskDetail() throw on an otherwise-
     successful update, surfacing as a false error toast. Callers should
     refetch (invalidate the detail query) instead of trusting this return. */
  async updateStatus(projectId: string, taskId: string, status: SeoTaskStatus): Promise<void> {
    await http.patch(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/status`,
      { status_id: Number(status) },
      IGNORE_BODY,
    );
  },

  /* Same rationale as updateStatus — mutation responses may omit the nested
     `task` object (or place fields directly under `data`). Parsing that as
     `data.task` throws after a successful write and shows a false error toast.
     Callers should invalidate the detail query instead of trusting a return. */
  async extendDeadline(projectId: string, taskId: string, payload: ExtendDeadlinePayload): Promise<void> {
    await http.post(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/extend`,
      payload,
      IGNORE_BODY,
    );
  },

  async updateTask(projectId: string, taskId: string, payload: SeoUpdateTaskPayload): Promise<void> {
    await http.put(
      `/v1/seo/projects/${projectId}/tasks/${taskId}`,
      toUpdateTaskBody(payload),
      IGNORE_BODY,
    );
  },

  createSelfTask(projectId: string, payload: CreateSelfSeoTaskPayload, files?: File[]) {
    if (files?.length) {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('phase', payload.phase);
      if (payload.phaseId != null) fd.append('phaseId', String(payload.phaseId));
      if (payload.phase_id != null) fd.append('phase_id', String(payload.phase_id));
      fd.append('priority', payload.priority);
      if (payload.description) fd.append('description', payload.description);
      if (payload.due_date) fd.append('due_date', payload.due_date);
      if (payload.estimated_hours != null) fd.append('estimated_hours', String(payload.estimated_hours));
      appendImportantLinks(fd, payload.importantLinks);
      appendSeoTaskFiles(fd, files);
      return http.post<SeoTaskDetailResponse>(
        `/v1/seo/employee/projects/${projectId}/tasks/self`, fd,
        { headers: { 'Content-Type': undefined } },
      );
    }
    return http.post<SeoTaskDetailResponse>(
      `/v1/seo/employee/projects/${projectId}/tasks/self`, payload,
    );
  },

  uploadAttachments(projectId: string, taskId: string, files: File[]) {
    const fd = new FormData();
    appendSeoTaskFiles(fd, files);
    return http.post<{ status: string; message: string; data: SeoTaskUploadResponse }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments`, fd,
      { headers: { 'Content-Type': undefined } },
    ).then(res => ({
      ...res,
      data: {
        ...res.data,
        data: mapUploadResponse(res.data.data),
      },
    }));
  },

  deleteAttachment(projectId: string, taskId: string, attachmentId: string | number) {
    return http.delete<{ status: string; message: string; data: SeoTaskUploadResponse }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
    ).then(res => ({
      ...res,
      data: {
        ...res.data,
        data: mapUploadResponse(res.data.data),
      },
    }));
  },

  getTimeLogs(projectId: string, taskId: string) {
    return http.get<{ status: string; message: string; data: SeoTaskTimeLogSummary }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs`,
    );
  },

  addTimeLog(projectId: string, taskId: string, payload: AddTimeLogPayload) {
    return http.post<{ status: string; message: string; data: SeoTaskTimeLog }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs`, payload,
    );
  },

  deleteTimeLog(projectId: string, taskId: string, timeLogId: string | number) {
    return http.delete<{ status: string; message: string; data: SeoTaskTimeLogSummary }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/time-logs/${timeLogId}`,
    );
  },

  getComments(projectId: string, taskId: string) {
    return http.get<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`,
    );
  },

  addComment(
    projectId: string,
    taskId: string,
    body: string,
    opts?: { parentId?: string | number; file?: File; mentions?: Array<{ type: string; id: string }> },
  ) {
    const fd = new FormData();
    fd.append('body', body);
    if (opts?.parentId != null) fd.append('parent_id', String(opts.parentId));
    if (opts?.file) fd.append('file', opts.file);
    opts?.mentions?.forEach((m, i) => {
      fd.append(`mentions[${i}][type]`, m.type);
      fd.append(`mentions[${i}][id]`, m.id);
    });
    return http.post<{ status: string; message: string; data: { comment: SeoTaskComment } }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments`, fd,
      { headers: { 'Content-Type': undefined } },
    );
  },

  updateComment(
    projectId: string,
    taskId: string,
    commentId: string | number,
    payload: { body: string; mentions?: Array<{ type: string; id: string }> },
  ) {
    return http.put<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      {
        body: payload.body,
        ...(payload.mentions?.length ? { mentions: payload.mentions } : {}),
      },
    );
  },

  deleteComment(projectId: string, taskId: string, commentId: string | number) {
    return http.delete<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    );
  },
};
