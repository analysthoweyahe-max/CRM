import { http } from '@/shared/services/http.service';
import type {
  MessengerConversationListResponse,
  MessengerMessageListResponse,
} from '../types/monitor.types';

/**
 * Super-admin instant messages monitor.
 * Same paths as company messenger — admin token returns all chats (incl. isObserver).
 */
export const messagesMonitorApi = {
  /** GET /api/v1/seo/messages/conversations */
  listConversations(params: { search?: string; per_page?: number; page?: number; type?: string } = {}) {
    return http.get<MessengerConversationListResponse>('/v1/seo/messages/conversations', {
      params: { per_page: 100, ...params },
      // Super-admin list can be heavy — allow longer than the default 10s.
      timeout: 30_000,
    });
  },

  /** GET /api/v1/seo/messages/conversations/{id}/messages */
  listMessages(conversationId: string, params: { per_page?: number; page?: number } = {}) {
    return http.get<MessengerMessageListResponse>(
      `/v1/seo/messages/conversations/${conversationId}/messages`,
      {
        params: { per_page: 100, ...params },
        timeout: 30_000,
      },
    );
  },
};
