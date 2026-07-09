import { http } from '@/shared/services/http.service';
import { STATUS_TO_WIRE, toSeoTask as mapSeoTask } from './seoTask.api';
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

interface RawSeoAssignee {
  id:        string | number;
  name:      string;
  initials?: string;
  avatar?:   string | null;
}

interface RawSeoTaskDetail extends RawSeoTask {
  assignees?:         RawSeoAssignee[];
  createdBy?:         RawSeoTaskRef | null;
  startDate?:         string | null;
  siteLinks?:         string[];
  referenceLinks?:    string[];
  notes?:             string | null;
  targetUrl?:         string | null;
  targetKeyword?:     string | null;
  searchIntent?:      string | null;
  searchVolume?:      number | null;
  keywordDifficulty?: number | null;
  metaTitle?:         string | null;
  metaDescription?:   string | null;
  allocatedHours?:    number;
  attachments?:       unknown[];
  attachmentsCount?:  number;
}

interface SeoTaskUploadResponse {
  id:               number;
  uuid?:            string;
  title?:           string;
  attachments:      SeoTaskAttachment[];
  attachmentsCount: number;
}

function toAssignee(raw: RawSeoAssignee): SeoAssignee {
  const name = raw.name ?? '';
  return {
    id:       String(raw.id),
    name,
    initials: raw.initials ?? name.charAt(0).toUpperCase(),
    avatarBg: 'bg-brand-500',
  };
}

function toSeoTaskDetail(raw: RawSeoTaskDetail): SeoTaskDetail {
  const attachments = normalizeSeoAttachments(raw.attachments);
  return {
    ...mapSeoTask(raw),
    assignees:         (raw.assignees ?? []).map(toAssignee),
    createdBy:         raw.createdBy ? { id: String(raw.createdBy.id), name: raw.createdBy.name } : null,
    startDate:         raw.startDate ?? null,
    siteLinks:         raw.siteLinks ?? [],
    referenceLinks:    raw.referenceLinks ?? [],
    notes:             raw.notes ?? null,
    targetUrl:         raw.targetUrl ?? null,
    targetKeyword:     raw.targetKeyword ?? null,
    searchIntent:      raw.searchIntent ?? null,
    searchVolume:      raw.searchVolume ?? null,
    keywordDifficulty: raw.keywordDifficulty ?? null,
    metaTitle:         raw.metaTitle ?? null,
    metaDescription:   raw.metaDescription ?? null,
    allocatedHours:    raw.allocatedHours ?? 0,
    attachments,
    attachmentsCount:  raw.attachmentsCount ?? attachments.length,
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
    }>(`/v1/seo/employee/projects/${projectId}/tasks/${taskId}`);

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

  async updateStatus(projectId: string, taskId: string, status: SeoTaskStatus): Promise<SeoTaskDetail> {
    const res = await http.patch<{ status: string; message: string; data: { task: RawSeoTaskDetail } }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/status`,
      { status: STATUS_TO_WIRE[status] },
    );
    return toSeoTaskDetail(res.data.data.task);
  },

  createSelfTask(projectId: string, payload: CreateSelfSeoTaskPayload, files?: File[]) {
    if (files?.length) {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('phase', payload.phase);
      fd.append('priority', payload.priority);
      if (payload.description)      fd.append('description', payload.description);
      if (payload.due_date)         fd.append('due_date', payload.due_date);
      if (payload.estimated_hours != null) fd.append('estimated_hours', String(payload.estimated_hours));
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
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/attachments`, fd,
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
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
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
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/time-logs`,
    );
  },

  addTimeLog(projectId: string, taskId: string, payload: AddTimeLogPayload) {
    return http.post<{ status: string; message: string; data: SeoTaskTimeLog }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/time-logs`, payload,
    );
  },

  deleteTimeLog(projectId: string, taskId: string, timeLogId: string | number) {
    return http.delete<{ status: string; message: string; data: SeoTaskTimeLogSummary }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/time-logs/${timeLogId}`,
    );
  },

  getComments(projectId: string, taskId: string) {
    return http.get<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments`,
    );
  },

  addComment(projectId: string, taskId: string, body: string) {
    return http.post<{ status: string; message: string; data: { comment: SeoTaskComment } }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments`, { body },
    );
  },

  updateComment(projectId: string, taskId: string, commentId: string | number, body: string) {
    return http.put<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, { body },
    );
  },

  deleteComment(projectId: string, taskId: string, commentId: string | number) {
    return http.delete<{ status: string; message: string; data: SeoTaskCommentsPage }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    );
  },
};
