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
  SendSeoMessagePayload,
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

  sendMessage(conversationId: string, payload: SendSeoMessagePayload | string) {
    const data = typeof payload === 'string' ? { body: payload } : payload;

    if (data.file) {
      const fd = new FormData();
      if (data.body?.trim()) fd.append('body', data.body.trim());
      if (data.reply_to != null) fd.append('reply_to', String(data.reply_to));
      fd.append('file', data.file);
      data.mentions?.forEach((m, i) => {
        fd.append(`mentions[${i}][type]`, m.type);
        fd.append(`mentions[${i}][id]`, m.id);
      });
      return http.post<SeoMessageSendResponse>(
        `${messengerBase()}/conversations/${conversationId}/messages`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
    }

    return http.post<SeoMessageSendResponse>(
      `${messengerBase()}/conversations/${conversationId}/messages`,
      {
        body: data.body?.trim() ?? '',
        ...(data.reply_to != null ? { reply_to: data.reply_to } : {}),
        ...(data.mentions?.length ? { mentions: data.mentions } : {}),
      },
    );
  },

  /** Toggle / add an emoji reaction on a message. */
  reactToMessage(conversationId: string, messageId: number | string, emoji: string) {
    return http.post<SeoMessageSendResponse>(
      `${messengerBase()}/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji },
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
