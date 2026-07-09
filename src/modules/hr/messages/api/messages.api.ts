import { http } from '@/shared/services/http.service';
import type {
  ConversationListResponse,
  ConversationSingleResponse,
  EmployeeLookupResponse,
  MessagesListResponse,
  SendMessageResponse,
} from '../types/messages.types';

export const messagesApi = {
  // Employee search for NewConversationModal
  searchEmployees(params?: { search?: string; limit?: number }) {
    return http.get<EmployeeLookupResponse>('/v1/hr/messages/lookups/employees', { params });
  },

  // Conversation list (sidebar, status filter)
  listConversations(params?: { status?: string; search?: string; per_page?: number; page?: number }) {
    return http.get<ConversationListResponse>('/v1/hr/messages/conversations', { params });
  },

  createConversation(payload: { employee_id: string; subject?: string; message?: string }) {
    return http.post<ConversationSingleResponse>('/v1/hr/messages/conversations', payload);
  },

  getConversation(uuid: string) {
    return http.get<ConversationSingleResponse>(`/v1/hr/messages/conversations/${uuid}`);
  },

  getMessages(uuid: string, params?: { per_page?: number; page?: number }) {
    return http.get<MessagesListResponse>(`/v1/hr/messages/conversations/${uuid}/messages`, { params });
  },

  sendMessage(uuid: string, body: string) {
    return http.post<SendMessageResponse>(`/v1/hr/messages/conversations/${uuid}/messages`, { body });
  },

  sendMedia(uuid: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', file.type.startsWith('image/') ? 'image' : 'file');
    return http.post<SendMessageResponse>(`/v1/hr/messages/conversations/${uuid}/media`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  markRead(uuid: string) {
    return http.post<{ status: string }>(`/v1/hr/messages/conversations/${uuid}/read`);
  },

  updateStatus(uuid: string, status: string) {
    return http.patch<{ status: string }>(`/v1/hr/messages/conversations/${uuid}/status`, { status });
  },
};
