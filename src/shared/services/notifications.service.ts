import { http } from './http.service';
import type { AppNotification } from '../types/notification.types';
import type { Role } from '../types/role.types';

export interface NotificationsPage {
  data:         AppNotification[];
  current_page: number;
  last_page:    number;
  total:        number;
  unreadCount:  number;
}

interface ApiEnvelope<T> {
  status:  string;
  message: string;
  data:    T;
}

/* Each role has its own notifications resource — confirmed: employee, hr,
   admin, seo-leader/seo-member (share /v1/seo/notifications). manager (PM)
   follows the same /v1/<role>/notifications convention every other PM
   endpoint in this codebase uses (/v1/pm/projects, /v1/pm/tasks, etc.) —
   not yet independently confirmed against a real Postman response, verify
   it returns 200 for a PM login. It was previously a placeholder pointing
   at /v1/hr/notifications, which a real PM account got a 403 from. */
const ROLE_NOTIFICATION_PREFIX: Record<Role, string> = {
  employee:    '/v1/employee/notifications',
  hr:          '/v1/hr/notifications',
  admin:       '/v1/admin/notifications',
  manager:     '/v1/pm/notifications',
  'seo-leader': '/v1/seo/notifications',
  'seo-member': '/v1/seo/notifications',
};

function prefixFor(role: Role | undefined): string {
  return (role && ROLE_NOTIFICATION_PREFIX[role]) || '/v1/employee/notifications';
}

export const notificationsApi = {
  list(role: Role | undefined, params?: { per_page?: number; page?: number }) {
    return http.get<ApiEnvelope<NotificationsPage>>(prefixFor(role), { params });
  },

  markRead(role: Role | undefined, id: string) {
    return http.put<ApiEnvelope<null>>(`${prefixFor(role)}/${id}/read`);
  },

  markAllRead(role: Role | undefined) {
    return http.put<ApiEnvelope<null>>(`${prefixFor(role)}/read-all`);
  },

  registerToken(deviceToken: string, deviceType: 'web' = 'web') {
    return http.post<ApiEnvelope<null>>('/v1/notifications/token', {
      device_token: deviceToken,
      device_type:  deviceType,
    });
  },
};
