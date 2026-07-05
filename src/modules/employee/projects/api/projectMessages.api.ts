import { http } from '@/shared/services/http.service';
import type { PmMessageListResponse, PmMessageSendResponse, PmMentionablesResponse } from '../types/projectMessage.types';

export const empProjectMessagesApi = {
  list(projectId: number | string, params?: { page?: number }) {
    return http.get<PmMessageListResponse>(`/v1/pm/employee/projects/${projectId}/messages`, { params });
  },

  send(projectId: number | string, body: string) {
    return http.post<PmMessageSendResponse>(`/v1/pm/employee/projects/${projectId}/messages`, { body });
  },

  mentionables(projectId: number | string, search?: string) {
    return http.get<PmMentionablesResponse>(`/v1/pm/employee/projects/${projectId}/messages/mentionables`, {
      params: { search },
    });
  },
};
