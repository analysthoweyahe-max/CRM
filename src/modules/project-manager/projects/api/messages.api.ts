import { http } from '@/shared/services/http.service';
import type { PmMessageListResponse, PmMessageSendResponse, PmMentionablesResponse } from '../types/message.types';

export const pmProjectMessagesApi = {
  list(projectId: number | string, params?: { page?: number }) {
    return http.get<PmMessageListResponse>(`/v1/pm/projects/${projectId}/messages`, { params });
  },

  send(projectId: number | string, body: string) {
    return http.post<PmMessageSendResponse>(`/v1/pm/projects/${projectId}/messages`, { body });
  },

  mentionables(projectId: number | string, search?: string) {
    return http.get<PmMentionablesResponse>(`/v1/pm/projects/${projectId}/messages/mentionables`, {
      params: { search },
    });
  },
};
