import type { LoginCredentials, SetPasswordPayload, AuthLoginResponse, InviteTokenPayload } from '@/modules/auth/types/auth.types';
import { http } from '@/shared/services/http.service';

export const authApi = {
  login(credentials: LoginCredentials) {
    return http.post<AuthLoginResponse>('/auth/login', credentials);
  },

  setPassword(payload: SetPasswordPayload) {
    return http.post<AuthLoginResponse>('/auth/set-password', payload);
  },

  validateInvite(token: string) {
    return http.get<InviteTokenPayload>(`/auth/invite/${token}`);
  },

  logout() {
    return http.post<void>('/auth/logout');
  },
};
