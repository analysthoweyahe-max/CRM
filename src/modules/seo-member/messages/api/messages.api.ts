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
  UpdateSeoMessagePayload,
} from '../types/messages.types';

/**
 * Company messenger (DMs + groups).
 * Prefer the chat URL first so each portal page hits its API family,
 * then fall back to the mapped portal role.
 *
 * /project-manager/... -> /v1/pm/messages
 * /employee/messenger  -> /v1/employee/messenger
 * /messages, /seo-leader|seo-member -> /v1/seo/messages
 *
 * Do NOT use /employee/messages for company chat - that path is HR support tickets.
 */
function messengerBase(): string {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    // Whole PM portal (incl. admin/super-admin browsing it) -> PM messenger
    if (path.startsWith('/project-manager')) return '/v1/pm/messages';
    if (path.startsWith('/employee/messenger')) return '/v1/employee/messenger';
    if (
      path === '/messages'
      || path.startsWith('/seo-leader')
      || path.startsWith('/seo-member')
    ) {
      return '/v1/seo/messages';
    }
  }

  const user = authService.getStoredUser();
  // Prefer mapped portal role — check seo-member BEFORE actor===employee
  // (seo members are employee-guard sessions but use the SEO messenger).
  if (user?.role === 'manager') return '/v1/pm/messages';
  if (
    user?.role === 'seo-leader'
    || user?.role === 'seo-member'
    || user?.role === 'hr'
    || user?.role === 'admin'
  ) {
    return '/v1/seo/messages';
  }
  if (user?.role === 'employee') return '/v1/employee/messenger';
  if (user?.section === 'pm') return '/v1/pm/messages';
  if (user?.section === 'seo') return '/v1/seo/messages';
  if (user?.actor === 'employee') return '/v1/employee/messenger';
  return '/v1/seo/messages';
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

  assignManagers(conversationId: string, payload: ManageSeoGroupMembersPayload) {
    return http.post<SeoConversationSingleResponse>(
      `${messengerBase()}/conversations/${conversationId}/managers`,
      payload,
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
    const needsMultipart = !!data.file || data.duration_seconds != null;

    if (needsMultipart) {
      const fd = new FormData();
      if (data.body?.trim()) fd.append('body', data.body.trim());
      if (data.reply_to != null) fd.append('reply_to', String(data.reply_to));
      if (data.duration_seconds != null) {
        fd.append('duration_seconds', String(data.duration_seconds));
      }
      if (data.file) fd.append('file', data.file);
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

  updateMessage(
    conversationId: string,
    messageId: number | string,
    payload: UpdateSeoMessagePayload,
  ) {
    return http.put<SeoMessageSendResponse>(
      `${messengerBase()}/conversations/${conversationId}/messages/${messageId}`,
      {
        body: payload.body.trim(),
        ...(payload.mentions?.length ? { mentions: payload.mentions } : {}),
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
