import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging }           from '@/shared/lib/firebase';
import type { AppNotification } from '@/shared/types/notification.types';

function nowTimeAr() {
  return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export function useFirebaseMessaging(onNotification: (n: AppNotification) => void) {
  useEffect(() => {
    // 1. Ask for browser notification permission & register FCM token
    if (!('Notification' in window)) return;

    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') return;

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
      if (!vapidKey) return; // VAPID key not configured yet

      getToken(messaging, { vapidKey }).then(token => {
        if (token) {
          // TODO: send `token` to your backend so it can target this device
          console.log('[FCM] Device token:', token);
        }
      }).catch(console.error);
    });

    // 2. Handle foreground messages (app is open)
    const unsubscribe = onMessage(messaging, payload => {
      const { title = 'إشعار جديد', body = '' } = payload.notification ?? {};

      // Show browser system notification even when app is open
      if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, { body, icon: '/vite.svg' });
        });
      }

      const notification: AppNotification = {
        id:      `fcm-${Date.now()}`,
        type:    'general',
        titleAr: title,
        titleEn: title,
        bodyAr:  body,
        bodyEn:  body,
        time:    nowTimeAr(),
        read:    false,
      };

      onNotification(notification);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
