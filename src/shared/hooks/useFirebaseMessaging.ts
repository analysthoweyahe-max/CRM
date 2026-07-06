import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '@/shared/lib/firebase';
import { notificationsApi } from '@/shared/services/notifications.service';

/** onPush fires when a foreground push arrives — the caller should refetch
    the real notifications list rather than trust the push payload directly. */
export function useFirebaseMessaging(onPush: () => void) {
  useEffect(() => {
    if (!('Notification' in window)) return;

    let unsubscribe = () => {};

    getMessagingInstance().then((messaging) => {
      if (!messaging) return;

      Notification.requestPermission().then(async permission => {
        if (permission !== 'granted') return;

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
        if (!vapidKey) return;

        if (!('serviceWorker' in navigator)) return;
        const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        getToken(messaging, { vapidKey, serviceWorkerRegistration }).then(token => {
          if (token) {
            notificationsApi.registerToken(token, 'web').catch(console.error);
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

        onPush();
      });
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
