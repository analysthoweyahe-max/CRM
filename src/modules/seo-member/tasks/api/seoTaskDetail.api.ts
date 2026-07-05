import { http } from '@/shared/services/http.service';
import { STATUS_TO_WIRE, toSeoTask } from './seoTask.api';
import type { RawSeoTask, RawSeoTaskRef } from './seoTask.api';
import type { SeoTaskStatus } from '../types/seoTask.types';
import type { SeoTaskDetail, SeoTaskDetailResponse, SeoAssignee } from '../types/seoTaskDetail.types';
import type { CreateSelfSeoTaskPayload } from '../types/seoTask.types';

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
  return {
    ...toSeoTask(raw),
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
  };
}

export const seoTaskDetailApi = {
  async getById(projectId: string, taskId: string): Promise<SeoTaskDetail> {
    const res = await http.get<{ status: string; message: string; data: RawSeoTaskDetail }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}`,
    );
    return toSeoTaskDetail(res.data.data);
  },

  async updateStatus(projectId: string, taskId: string, status: SeoTaskStatus): Promise<SeoTaskDetail> {
    const res = await http.patch<{ status: string; message: string; data: RawSeoTaskDetail }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/status`,
      { status: STATUS_TO_WIRE[status] },
    );
    return toSeoTaskDetail(res.data.data);
  },

  createSelfTask(projectId: string, payload: CreateSelfSeoTaskPayload) {
    return http.post<SeoTaskDetailResponse>(
      `/v1/seo/employee/projects/${projectId}/tasks/self`, payload,
    );
  },

  /* Attachments / time-logs / comments — same prefix as the rest, per the
     confirmed endpoint table. No UI consumes these yet on the employee side. */
  uploadAttachment(projectId: string, taskId: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return http.post<{ status: string; message: string; data: { id: number; name: string; url: string } }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/attachments`, fd,
      { headers: { 'Content-Type': undefined } },
    );
  },

  getTimeLogs(projectId: string, taskId: string) {
    return http.get<{ status: string; message: string; data: { id: number; hours: number; note?: string; loggedAt: string }[] }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/time-logs`,
    );
  },

  addTimeLog(projectId: string, taskId: string, payload: { hours: number; note?: string }) {
    return http.post<{ status: string; message: string; data: { id: number; hours: number; note?: string; loggedAt: string } }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/time-logs`, payload,
    );
  },

  getComments(projectId: string, taskId: string) {
    return http.get<{ status: string; message: string; data: unknown }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments`,
    );
  },

  addComment(projectId: string, taskId: string, body: string) {
    return http.post<{ status: string; message: string; data: unknown }>(
      `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/comments`, { body },
    );
  },
};
