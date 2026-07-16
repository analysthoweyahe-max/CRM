import axios from 'axios';
import { env } from '@/app/config/env';
import { REMEMBER_ME_KEY } from '@/app/config/constants';
import type { AuthActor } from '@/modules/auth/types/auth.types';
import {
  getStoredAuthActor,
  getStoredRefreshToken,
  getStoredUser,
  readAccessTokenFromPayload,
  readRefreshTokenFromPayload,
  readRememberFromPayload,
  rotateTokens,
  storeAuthSession,
} from './tokenStorage';

interface RefreshApiEnvelope {
  status?:  string;
  message?: string;
  data?:    Record<string, unknown>;
}

function unwrapPayload(response: unknown): Record<string, unknown> {
  const root = response as Record<string, unknown>;
  const inner = root?.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root ?? {};
}

function refreshPath(actor: AuthActor): string {
  return actor === 'employee'
    ? '/v1/employee/auth/refresh-token'
    : '/v1/admin/auth/refresh-token';
}

/**
 * Silent token rotation via a bare axios call (no app interceptors) so a 401
 * on refresh cannot recurse into another refresh attempt.
 *
 * Returns the new access token. Always replaces the stored refresh token
 * (one-time use on the backend).
 */
export async function refreshSession(): Promise<string> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const actor = getStoredAuthActor();
  const base = (env.apiBaseUrl ?? '').replace(/\/$/, '');
  const url = `${base}${refreshPath(actor)}`;

  const { data } = await axios.post<RefreshApiEnvelope>(
    url,
    { refresh_token: refreshToken },
    {
      headers: {
        Accept:         'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15_000,
    },
  );

  const payload = unwrapPayload(data);
  const accessToken = readAccessTokenFromPayload(payload);
  const nextRefresh = readRefreshTokenFromPayload(payload);

  if (!accessToken || !nextRefresh) {
    throw new Error('Invalid refresh response');
  }

  const remembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  const remember = readRememberFromPayload(payload, remembered);
  const user = getStoredUser();

  if (user) {
    storeAuthSession(accessToken, user, remember, nextRefresh);
  } else {
    rotateTokens(accessToken, nextRefresh);
  }

  return accessToken;
}
