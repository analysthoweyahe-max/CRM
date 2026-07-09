import { getToken } from 'firebase/messaging';
import { env } from '@/app/config/env';
import { getMessagingInstance } from '@/shared/lib/firebase';
import { notificationsApi } from './notifications.service';

let lastRegisteredToken: string | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

/** Request permission and return the current FCM device token, or null. */
export async function getFcmToken(): Promise<string | null> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  if (!vapidKey) return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  if (!swRegistration) {
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }

  return getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration });
}

/** Register the FCM token with the backend. Skips duplicate tokens. */
export async function registerFcmToken(): Promise<boolean> {
  try {
    const token = await getFcmToken();
    if (!token) return false;

    if (token === lastRegisteredToken) return true;

    await notificationsApi.registerToken(token, 'web');
    lastRegisteredToken = token;

    if (env.isDev) console.log('[FCM] Token registered with backend');
    return true;
  } catch (err) {
    if (env.isDev) console.error('[FCM] Token registration failed', err);
    return false;
  }
}

/** Clear cached token state on logout. */
export function resetFcmRegistration(): void {
  lastRegisteredToken = null;
}
