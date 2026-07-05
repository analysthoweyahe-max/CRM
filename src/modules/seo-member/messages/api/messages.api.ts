import { http } from '@/shared/services/http.service';
import type {
  SeoConversationListResponse,
  SeoMessageListResponse,
  SeoMessageSendResponse,
  SeoMentionablesResponse,
  CreateSeoConversationPayload,
} from '../types/messages.types';

export const seoMessagesApi = {
  listConversations(params?: { search?: string }) {
    return http.get<SeoConversationListResponse>('/v1/seo/messages/conversations', { params });
  },

  createConversation(payload: CreateSeoConversationPayload) {
    return http.post('/v1/seo/messages/conversations', payload);
  },

  getMessages(conversationId: string, params?: { page?: number }) {
    return http.get<SeoMessageListResponse>(
      `/v1/seo/messages/conversations/${conversationId}/messages`, { params },
    );
  },

  sendMessage(conversationId: string, body: string) {
    return http.post<SeoMessageSendResponse>(
      `/v1/seo/messages/conversations/${conversationId}/messages`, { body },
    );
  },

  markRead(conversationId: string) {
    return http.put(`/v1/seo/messages/conversations/${conversationId}/read`);
  },

  mentionables(search?: string) {
    return http.get<SeoMentionablesResponse>('/v1/seo/messages/mentionables', { params: { search } });
  },
};
