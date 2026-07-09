import { http } from '@/shared/services/http.service';
import type {
  AdminLoginApiResponse,
  AdminAuthSuccessApiResponse,
  AdminOtpResendApiResponse,
  AdminProfileApiResponse,
  EmployeeLoginApiResponse,
  EmployeeProfileApiResponse,
  AdminInviteApiResponse,
  EmployeeInviteApiResponse,
  ChangePasswordPayload,
  ChangePasswordApiResponse,
  ForgotPasswordApiResponse,
  EmployeeForgotPasswordApiResponse,
  EmployeeVerifyResetOtpApiResponse,
  PasswordResetVerifyApiResponse,
} from '@/modules/auth/types/auth.types';

export const authApi = {
  // ── Admin / HR Manager ───────────────────────────────────────────────────

  adminLogin(credentials: { admin_id: string; password: string }) {
    return http.post<AdminLoginApiResponse>('/v1/admin/auth/login', credentials);
  },

  // Exchanges the one-time magic-login token (from the super-admin email link)
  // for a real access token + admin profile.
  adminMagicLogin(token: string) {
    return http.get<AdminAuthSuccessApiResponse>('/v1/admin/auth/magic-login', {
      params: { token },
    });
  },

  // Verifies the OTP code emailed to a super-admin on each login attempt.
  adminVerifyOtp(payload: { admin_id: string; adminId?: string; email?: string; code: string; otp?: string }) {
    return http.post<AdminAuthSuccessApiResponse>('/v1/admin/auth/login/verify-otp', payload);
  },

  // Requests a fresh OTP code for the given super-admin.
  adminResendOtp(payload: { admin_id: string; adminId?: string; email?: string }) {
    return http.post<AdminOtpResendApiResponse>('/v1/admin/auth/login/resend-otp', payload);
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

  adminProfile() {
    return http.get<AdminProfileApiResponse>('/v1/admin/auth/profile');
  },

  adminForgotPassword(payload: { email: string }) {
    return http.post<ForgotPasswordApiResponse>('/v1/admin/auth/forgot-password', payload);
  },

  verifyAdminPasswordReset(token: string) {
    return http.get<PasswordResetVerifyApiResponse>(`/v1/admin/auth/password-resets/${token}`);
  },

  resetAdminPassword(token: string, payload: { password: string; password_confirmation: string }) {
    return http.post<void>(`/v1/admin/auth/password-resets/${token}`, payload);
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

  employeeForgotPassword(payload: { email: string }) {
    return http.post<EmployeeForgotPasswordApiResponse>('/v1/employee/auth/forgot-password', payload);
  },

  employeeVerifyResetOtp(payload: { email: string; code: string; otp?: string }) {
    return http.post<EmployeeVerifyResetOtpApiResponse>(
      '/v1/employee/auth/verify-reset-otp',
      { ...payload, otp: payload.otp ?? payload.code },
    );
  },

  employeeResetPasswordOtp(payload: {
    token:                 string;
    reset_token?:          string;
    password:              string;
    password_confirmation: string;
  }) {
    return http.post<ForgotPasswordApiResponse>('/v1/employee/auth/reset-password', {
      ...payload,
      reset_token: payload.reset_token ?? payload.token,
    });
  },
};
