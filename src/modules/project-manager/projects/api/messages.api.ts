import { http } from '@/shared/services/http.service';
import { buildProjectMessageForm } from '@/shared/utils/projectChat.utils';
import type { PmMessageListResponse, PmMessageSendResponse, PmMentionablesResponse } from '../types/message.types';

export const pmProjectMessagesApi = {
  list(projectId: number | string, params?: { page?: number; per_page?: number; search?: string }) {
    return http.get<PmMessageListResponse>(`/v1/pm/projects/${projectId}/messages`, { params });
  },

  send(projectId: number | string, payload: { body?: string; file?: File }) {
    const data = buildProjectMessageForm(payload);
    if (data instanceof FormData) {
      return http.post<PmMessageSendResponse>(`/v1/pm/projects/${projectId}/messages`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return http.post<PmMessageSendResponse>(`/v1/pm/projects/${projectId}/messages`, data);
  },

  mentionables(projectId: number | string, search?: string) {
    return http.get<PmMentionablesResponse>(`/v1/pm/projects/${projectId}/messages/mentionables`, {
      params: { search },
    });
  },
};
