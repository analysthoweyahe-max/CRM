import { http } from '@/shared/services/http.service';
import type {
  PmClientUpdatesApiResponse,
  PmPhaseMessagesApiResponse,
  PmSendMessageApiResponse,
} from '../types/clientUpdates.types';

export const pmClientUpdatesApi = {
  list(projectId: number | string) {
    return http.get<PmClientUpdatesApiResponse>(`/v1/pm/projects/${projectId}/client-updates`);
  },

  getMessages(projectId: number | string, phaseId: number | string, params: { page?: number } = {}) {
    return http.get<PmPhaseMessagesApiResponse>(
      `/v1/pm/projects/${projectId}/client-updates/phases/${phaseId}/messages`,
      { params },
    );
  },

  sendMessage(projectId: number | string, phaseId: number | string, body: string) {
    return http.post<PmSendMessageApiResponse>(
      `/v1/pm/projects/${projectId}/client-updates/phases/${phaseId}/messages`,
      { body },
    );
  },

  uploadAttachment(projectId: number | string, phaseId: number | string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(
      `/v1/pm/projects/${projectId}/client-updates/phases/${phaseId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};
