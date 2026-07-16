import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/app/config/env';
import { LANG_KEY } from '@/app/config/constants';
import {
  clearAuthSession,
  getStoredAccessToken,
} from '@/modules/auth/services/tokenStorage';
import { refreshSession } from '@/modules/auth/services/refreshSession';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Set true for optional/unverified endpoints so a 401 rejects the
     *  request normally without forcing a full app logout+redirect. */
    skip401Redirect?: boolean;
    /** Internal: request already retried after a token refresh. */
    _retry?: boolean;
  }
}

const PUBLIC_AUTH_SEGMENTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/password-resets/',
  '/auth/invitations/',
  '/auth/magic-login',
  '/v1/admin/auth/login',
  '/v1/admin/auth/forgot-password',
  '/v1/admin/auth/password-resets/',
  '/v1/admin/auth/refresh-token',
  '/v1/employee/auth/login',
  '/v1/employee/auth/invitations/',
  '/v1/employee/auth/forgot-password',
  '/v1/employee/auth/verify-reset-otp',
  '/v1/employee/auth/reset-password',
  '/v1/employee/auth/refresh-token',
] as const;

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_SEGMENTS.some((segment) => url.includes(segment));
}

function forceLoginRedirect(): void {
  clearAuthSession();
  if (window.location.pathname.startsWith('/auth/')) return;
  window.location.href = '/auth/login';
}

type QueueItem = {
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error ?? new Error('Refresh failed'));
    else resolve(token);
  });
  failedQueue = [];
}

const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 10_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const publicAuth = isPublicAuthRequest(config.url);

  if (!publicAuth) {
    const token = getStoredAccessToken();
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
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const publicAuth = isPublicAuthRequest(original?.url);
    const skipRedirect = original?.skip401Redirect === true;

    if (error.response?.status !== 401 || publicAuth || skipRedirect || !original) {
      return Promise.reject(error);
    }

    // Already retried once after refresh — give up.
    if (original._retry) {
      forceLoginRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            original._retry = true;
            if (original.headers) {
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(http(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Soft refresh — no full page reload, so attendance/task timers keep running.
      const accessToken = await refreshSession();
      processQueue(null, accessToken);
      if (original.headers) {
        original.headers.Authorization = `Bearer ${accessToken}`;
      }
      return http(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLoginRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { http };
