import { http } from '@/shared/services/http.service';
import type {
  ClientIssueApiResponse,
  ClientIssueListApiResponse,
  CreateClientIssuePayload,
  ProjectClientIssuePortal,
  UpdateClientIssuePayload,
  UpdateClientIssueStatusPayload,
} from '../types/projectClientIssue.types';

function basePath(portal: ProjectClientIssuePortal, projectId: string | number): string {
  switch (portal) {
    case 'pm-manager':
      return `/v1/pm/projects/${projectId}/client-issues`;
    case 'pm-employee':
      return `/v1/employee/projects/${projectId}/client-issues`;
    case 'seo-leader':
      return `/v1/seo/projects/${projectId}/client-issues`;
    case 'seo-member':
      return `/v1/seo/employee/projects/${projectId}/client-issues`;
  }
}

function issuePath(
  portal: ProjectClientIssuePortal,
  projectId: string | number,
  issueId: string | number,
) {
  return `${basePath(portal, projectId)}/${issueId}`;
}

export const projectClientIssueApi = {
  list(portal: ProjectClientIssuePortal, projectId: string | number) {
    return http.get<ClientIssueListApiResponse>(basePath(portal, projectId));
  },

  get(portal: ProjectClientIssuePortal, projectId: string | number, issueId: string | number) {
    return http.get<ClientIssueApiResponse>(issuePath(portal, projectId, issueId));
  },

  create(portal: ProjectClientIssuePortal, projectId: string | number, payload: CreateClientIssuePayload) {
    return http.post<ClientIssueApiResponse>(basePath(portal, projectId), payload);
  },

  update(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    payload: UpdateClientIssuePayload,
  ) {
    return http.put<ClientIssueApiResponse>(issuePath(portal, projectId, issueId), payload);
  },

  updateStatus(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    payload: UpdateClientIssueStatusPayload,
  ) {
    return http.patch<ClientIssueApiResponse>(
      `${issuePath(portal, projectId, issueId)}/status`,
      payload,
    );
  },

  remove(portal: ProjectClientIssuePortal, projectId: string | number, issueId: string | number) {
    return http.delete(issuePath(portal, projectId, issueId));
  },

  uploadImage(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    file: File,
  ) {
    const fd = new FormData();
    fd.append('image', file);
    return http.post<ClientIssueApiResponse>(
      `${issuePath(portal, projectId, issueId)}/image`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  /** Upload multiple images sequentially via the single-image endpoint. */
  async uploadImages(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    files: File[],
  ) {
    let last = null as Awaited<ReturnType<typeof projectClientIssueApi.uploadImage>> | null;
    for (const file of files) {
      last = await projectClientIssueApi.uploadImage(portal, projectId, issueId, file);
    }
    return last;
  },

  uploadFile(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    file: File,
  ) {
    const fd = new FormData();
    fd.append('file', file);
    return http.post<ClientIssueApiResponse>(
      `${issuePath(portal, projectId, issueId)}/file`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  /** Upload multiple files sequentially via the single-file endpoint. */
  async uploadFiles(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    files: File[],
  ) {
    let last = null as Awaited<ReturnType<typeof projectClientIssueApi.uploadFile>> | null;
    for (const file of files) {
      last = await projectClientIssueApi.uploadFile(portal, projectId, issueId, file);
    }
    return last;
  },

  removeAttachment(
    portal: ProjectClientIssuePortal,
    projectId: string | number,
    issueId: string | number,
    attachmentId: number,
  ) {
    return http.delete<ClientIssueApiResponse>(
      `${issuePath(portal, projectId, issueId)}/attachments/${attachmentId}`,
    );
  },
};
