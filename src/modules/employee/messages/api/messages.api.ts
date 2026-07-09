import { http } from '@/shared/services/http.service';
import type {
  EmpConversationListResponse,
  EmpConversationSingleResponse,
  EmpMessagesResponse,
  EmpSendMessageResponse,
  EmpConversationListParams,
  EmpMessagesParams,
} from '../types/messages.types';

export const empMessagesApi = {
  listConversations(params?: EmpConversationListParams) {
    return http.get<EmpConversationListResponse>(
      '/v1/employee/messages/conversations',
      { params },
    );
  },

  createConversation(data: Record<string, unknown>) {
    return http.post<EmpConversationSingleResponse>(
      '/v1/employee/messages/conversations',
      data,
    );
  },

  getConversation(uuid: string) {
    return http.get<EmpConversationSingleResponse>(
      `/v1/employee/messages/conversations/${uuid}`,
    );
  },

  getMessages(uuid: string, params?: EmpMessagesParams) {
    return http.get<EmpMessagesResponse>(
      `/v1/employee/messages/conversations/${uuid}/messages`,
      { params },
    );
  },

  sendMessage(uuid: string, body: string) {
    return http.post<EmpSendMessageResponse>(
      `/v1/employee/messages/conversations/${uuid}/messages`,
      { body },
    );
  },

  sendMedia(uuid: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return http.post<EmpSendMessageResponse>(
      `/v1/employee/messages/conversations/${uuid}/media`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  markRead(uuid: string) {
    return http.put<{ status: string }>(
      `/v1/employee/messages/conversations/${uuid}/read`,
    );
  },
};
