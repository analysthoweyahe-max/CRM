import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { env } from '@/app/config/env';
import { TOKEN_KEY } from '@/app/config/constants';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<'pusher'>;
  }
}

type EchoStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disabled';

let echoInstance: Echo<'pusher'> | null = null;
let echoStatus: EchoStatus = 'idle';
const statusListeners = new Set<(status: EchoStatus) => void>();

function readAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function setStatus(next: EchoStatus) {
  if (echoStatus === next) return;
  echoStatus = next;
  statusListeners.forEach((fn) => fn(next));
}

export function isEchoConfigured(): boolean {
  return Boolean(env.pusherKey);
}

export function getEchoStatus(): EchoStatus {
  if (!isEchoConfigured()) return 'disabled';
  return echoStatus;
}

/** True when private channel auth succeeded — safe to slow down polling. */
export function isEchoLive(): boolean {
  return echoStatus === 'connected';
}

export function subscribeEchoStatus(listener: (status: EchoStatus) => void): () => void {
  statusListeners.add(listener);
  listener(getEchoStatus());
  return () => { statusListeners.delete(listener); };
}

/** Shared Echo client (one connection per tab). */
export function getEcho(): Echo<'pusher'> | null {
  if (!isEchoConfigured() || typeof window === 'undefined') {
    setStatus('disabled');
    return null;
  }

  const token = readAuthToken();
  if (!token) {
    setStatus('error');
    return null;
  }

  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;
  setStatus('connecting');

  echoInstance = new Echo({
    broadcaster:  'pusher',
    key:          env.pusherKey,
    cluster:      env.pusherCluster,
    forceTLS:     true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${env.apiBaseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        'application/json',
      },
    },
  });

  window.Echo = echoInstance;

  const pusher = echoInstance.connector?.pusher as Pusher | undefined;
  pusher?.connection?.bind('connected', () => {
    if (env.isDev) console.log('[Echo] socket connected');
    // Still waiting for private-channel auth — keep "connecting" until subscribed.
    if (echoStatus === 'idle' || echoStatus === 'error') setStatus('connecting');
  });
  pusher?.connection?.bind('unavailable', () => {
    if (env.isDev) console.warn('[Echo] socket unavailable');
    setStatus('error');
  });
  pusher?.connection?.bind('failed', () => {
    if (env.isDev) console.warn('[Echo] socket failed');
    setStatus('error');
  });
  pusher?.connection?.bind('disconnected', () => {
    if (env.isDev) console.warn('[Echo] socket disconnected');
    setStatus('error');
  });

  return echoInstance;
}

export function markEchoSubscribed(): void {
  setStatus('connected');
}

export function markEchoSubscribeError(): void {
  setStatus('error');
}

/** Drop the shared client (e.g. on logout). */
export function disconnectEcho(): void {
  try {
    echoInstance?.disconnect();
  } catch {
    /* ignore */
  }
  echoInstance = null;
  if (typeof window !== 'undefined') delete window.Echo;
  setStatus(isEchoConfigured() ? 'idle' : 'disabled');
}

/** @deprecated use getEcho() */
export function createEcho(): Echo<'pusher'> | null {
  return getEcho();
}
