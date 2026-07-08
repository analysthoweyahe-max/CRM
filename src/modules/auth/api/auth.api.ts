import { http } from '@/shared/services/http.service';
import type {
  AdminLoginApiResponse,
  AdminAuthSuccessApiResponse,
  EmployeeLoginApiResponse,
  EmployeeProfileApiResponse,
  AdminInviteApiResponse,
  EmployeeInviteApiResponse,
  ChangePasswordPayload,
  ChangePasswordApiResponse,
} from '@/modules/auth/types/auth.types';

export const authApi = {
  // ── Admin / HR Manager ───────────────────────────────────────────────────

  adminLogin(credentials: { admin_id: string; password: string }) {
    return http.post<AdminLoginApiResponse>('/v1/admin/auth/login', credentials);
  },

  adminLogout() {
    return http.post<void>('/v1/admin/auth/logout');
  },

  verifyAdminInvite(token: string) {
    return http.get<AdminInviteApiResponse>(`/v1/admin/auth/invitations/${token}`);
  },

  setAdminPassword(token: string, payload: { password: string; password_confirmation: string }) {
    return http.post<AdminAuthSuccessApiResponse>(
      `/v1/admin/auth/invitations/${token}/set-password`,
      payload,
    );
  },

  adminChangePassword(payload: ChangePasswordPayload) {
    return http.post<ChangePasswordApiResponse>('/v1/admin/auth/profile/password', payload);
  },

  // ── Employee ─────────────────────────────────────────────────────────────

  employeeLogin(credentials: { email?: string; employee_id?: string; password: string }) {
    return http.post<EmployeeLoginApiResponse>('/v1/employee/auth/login', credentials);
  },

  employeeLogout() {
    return http.post<void>('/v1/employee/auth/logout');
  },

  employeeProfile() {
    return http.get<EmployeeProfileApiResponse>('/v1/employee/auth/profile');
  },

  verifyEmployeeInvite(token: string) {
    return http.get<EmployeeInviteApiResponse>(`/v1/employee/auth/invitations/${token}`);
  },

  setEmployeePassword(token: string, payload: { password: string; password_confirmation: string }) {
    return http.post<EmployeeLoginApiResponse>(
      `/v1/employee/auth/invitations/${token}/set-password`,
      payload,
    );
  },

  employeeChangePassword(payload: ChangePasswordPayload) {
    return http.post<ChangePasswordApiResponse>('/v1/employee/auth/profile/password', payload);
  },
};
