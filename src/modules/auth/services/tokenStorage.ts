import { TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY } from '@/app/config/constants';
import type { AuthActor, AuthUser } from '@/modules/auth/types/auth.types';

function isRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

function authStorage(): Storage {
  return isRememberMe() ? localStorage : sessionStorage;
}

function clearStorageKeys(storage: Storage): void {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

/** Wipe open task-timer snapshots so a forced logout doesn't revive stale timers. */
function clearTaskTimerSnapshots(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('hr_open_task_timers:')) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredAuthActor(): AuthActor {
  return getStoredUser()?.actor === 'employee' ? 'employee' : 'admin';
}

/**
 * Persist access + refresh tokens.
 * Refresh tokens come from the JSON body (never httpOnly cookies from the backend).
 * Uses localStorage when remember=true, otherwise sessionStorage.
 */
export function storeAuthSession(
  accessToken: string,
  user: AuthUser,
  rememberMe: boolean,
  refreshToken?: string | null,
): void {
  const primary = rememberMe ? localStorage : sessionStorage;
  const secondary = rememberMe ? sessionStorage : localStorage;

  clearStorageKeys(secondary);

  primary.setItem(TOKEN_KEY, accessToken);
  primary.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    primary.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    primary.removeItem(REFRESH_TOKEN_KEY);
  }
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
}

/** After a successful refresh — rotate both tokens; keep the same remember preference. */
export function rotateTokens(accessToken: string, refreshToken: string): void {
  const storage = authStorage();
  storage.setItem(TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  // Keep user blob in sync on the same storage
  const other = storage === localStorage ? sessionStorage : localStorage;
  other.removeItem(TOKEN_KEY);
  other.removeItem(REFRESH_TOKEN_KEY);
}

export function updateStoredUser(user: AuthUser): void {
  authStorage().setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  clearStorageKeys(localStorage);
  clearStorageKeys(sessionStorage);
  localStorage.removeItem(REMEMBER_ME_KEY);
  clearTaskTimerSnapshots();
}

export function readAccessTokenFromPayload(payload: Record<string, unknown>): string | undefined {
  const token = payload.accessToken ?? payload.access_token;
  return typeof token === 'string' ? token : undefined;
}

export function readRefreshTokenFromPayload(payload: Record<string, unknown>): string | undefined {
  const token = payload.refreshToken ?? payload.refresh_token;
  return typeof token === 'string' ? token : undefined;
}

export function readRememberFromPayload(
  payload: Record<string, unknown>,
  fallback: boolean,
): boolean {
  if (typeof payload.remember === 'boolean') return payload.remember;
  return fallback;
}
