import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/app/config/env';
import { TOKEN_KEY, USER_KEY, LANG_KEY } from '@/app/config/constants';

const PUBLIC_AUTH_SEGMENTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/password-resets/',
  '/auth/invitations/',
  '/auth/magic-login',
  '/v1/admin/auth/login',
  '/v1/admin/auth/forgot-password',
  '/v1/admin/auth/password-resets/',
  '/v1/employee/auth/forgot-password',
  '/v1/employee/auth/verify-reset-otp',
  '/v1/employee/auth/reset-password',
] as const;

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_SEGMENTS.some((segment) => url.includes(segment));
}

const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 10_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const publicAuth = isPublicAuthRequest(config.url);

  if (!publicAuth) {
    const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const lang = localStorage.getItem(LANG_KEY);
  if (config.headers) {
    config.headers['Accept-Language'] = lang === 'en' ? 'en' : 'ar';
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const publicAuth = isPublicAuthRequest(error.config?.url);

    if (error.response?.status === 401 && !publicAuth) {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export { http };
