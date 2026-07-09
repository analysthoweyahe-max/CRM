import { http } from '@/shared/services/http.service';
import type { MonitoredMessageListResponse, MessagesMonitorFilters } from '../types/monitor.types';

export const messagesMonitorApi = {
  list(filters: MessagesMonitorFilters = {}) {
    return http.get<MonitoredMessageListResponse>('/v1/pm/admin/messages', { params: filters });
  },

  projectMessages(projectId: string | number, params: { search?: string; per_page?: number; page?: number; source?: string } = {}) {
    return http.get<MonitoredMessageListResponse>(`/v1/pm/admin/projects/${projectId}/messages`, { params });
  },
};
