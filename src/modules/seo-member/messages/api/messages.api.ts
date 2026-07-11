import { http } from '@/shared/services/http.service';
import { authService } from '@/modules/auth/services/auth.service';
import type {
  SeoConversationListResponse,
  SeoConversationSingleResponse,
  SeoMessageListResponse,
  SeoMessageSendResponse,
  SeoMentionablesResponse,
  CreateSeoConversationPayload,
  CreateSeoGroupPayload,
  ManageSeoGroupMembersPayload,
  SeoConversationListParams,
} from '../types/messages.types';

/**
 * Company messenger (DMs + groups).
 * Admin/super-admin → /v1/seo/messages
 * Employee → /v1/employee/messenger  (same data; do NOT use /employee/messages — that is HR)
 */
function messengerBase(): string {
  const actor = authService.getStoredUser()?.actor;
  return actor === 'employee' ? '/v1/employee/messenger' : '/v1/seo/messages';
}

export const seoMessagesApi = {
  listConversations(params?: SeoConversationListParams) {
    return http.get<SeoConversationListResponse>(`${messengerBase()}/conversations`, { params });
  },

  getConversation(conversationId: string) {
    return http.get<SeoConversationSingleResponse>(
      `${messengerBase()}/conversations/${conversationId}`,
    );
  },

  createConversation(payload: CreateSeoConversationPayload) {
    return http.post<SeoConversationSingleResponse>(`${messengerBase()}/conversations`, payload);
  },

  createGroup(payload: CreateSeoGroupPayload) {
    return http.post<SeoConversationSingleResponse>(`${messengerBase()}/groups`, payload);
  },

  addMembers(conversationId: string, payload: ManageSeoGroupMembersPayload) {
    return http.post<SeoConversationSingleResponse>(
      `${messengerBase()}/conversations/${conversationId}/members`,
      payload,
    );
  },

  removeMembers(conversationId: string, payload: ManageSeoGroupMembersPayload) {
    return http.delete<SeoConversationSingleResponse>(
      `${messengerBase()}/conversations/${conversationId}/members`,
      { data: payload },
    );
  },

  leaveGroup(conversationId: string) {
    return http.post(`${messengerBase()}/conversations/${conversationId}/leave`);
  },

  getMessages(conversationId: string, params?: { page?: number }) {
    return http.get<SeoMessageListResponse>(
      `${messengerBase()}/conversations/${conversationId}/messages`,
      { params },
    );
  },

  sendMessage(conversationId: string, body: string) {
    return http.post<SeoMessageSendResponse>(
      `${messengerBase()}/conversations/${conversationId}/messages`,
      { body },
    );
  },

  markRead(conversationId: string) {
    return http.put(`${messengerBase()}/conversations/${conversationId}/read`);
  },

  mentionables(search?: string) {
    return http.get<SeoMentionablesResponse>(`${messengerBase()}/mentionables`, {
      params: search ? { search } : undefined,
    });
  },
};
