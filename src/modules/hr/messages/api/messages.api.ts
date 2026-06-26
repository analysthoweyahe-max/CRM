import { http } from '@/shared/services/http.service';
import type {
  ChatTokenResponse,
  ConversationListResponse,
  ConversationSingleResponse,
  EmployeeLookupResponse,
} from '../types/messages.types';

export const messagesApi = {
  // Stream credentials — backend returns { token, api_key, user_id }
  getChatToken() {
    return http.get<ChatTokenResponse>('/chat/token');
  },

  // Employee search for NewConversationModal
  searchEmployees(params?: { search?: string; limit?: number }) {
    return http.get<EmployeeLookupResponse>('/v1/hr/messages/lookups/employees', { params });
  },

  // Persist conversation in Laravel; response may include stream_channel_id
  createConversation(payload: { participant_id: string }) {
    return http.post<ConversationSingleResponse>('/v1/hr/messages/conversations', payload);
  },

  // Conversation list (sidebar, status filter)
  listConversations(params?: { status?: string; search?: string; per_page?: number; page?: number }) {
    return http.get<ConversationListResponse>('/v1/hr/messages/conversations', { params });
  },
};
