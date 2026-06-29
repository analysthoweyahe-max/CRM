import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '@/shared/lib/firebase';
import type { AppNotification } from '@/shared/types/notification.types';

function nowTimeAr() {
  return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export function useFirebaseMessaging(onNotification: (n: AppNotification) => void) {
  useEffect(() => {
    if (!('Notification' in window)) return;

    let unsubscribe = () => {};

    getMessagingInstance().then((messaging) => {
      if (!messaging) return;

      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') return;

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
        if (!vapidKey) return;

        getToken(messaging, { vapidKey }).then(token => {
          if (token) {
            console.log('[FCM] Device token:', token);
          }
        }).catch(console.error);
      });

      unsubscribe = onMessage(messaging, payload => {
        const { title = 'إشعار جديد', body = '' } = payload.notification ?? {};

        if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, { body, icon: '/vite.svg' });
          });
        }

        onNotification({
          id:      `fcm-${Date.now()}`,
          type:    'general',
          titleAr: title,
          titleEn: title,
          bodyAr:  body,
          bodyEn:  body,
          time:    nowTimeAr(),
          read:    false,
        });
      });
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
