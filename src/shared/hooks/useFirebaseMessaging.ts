import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '@/shared/lib/firebase';
import { notificationsApi } from '@/shared/services/notifications.service';

/** onPush fires when a foreground push arrives — the caller should refetch
    the real notifications list rather than trust the push payload directly. */
export function useFirebaseMessaging(onPush: () => void) {
  // The effect below only runs once ([] deps, intentionally — it must not
  // re-register the token/listener on every render). `onPush` is a fresh
  // closure each render (it wraps `refetch`, which is scoped to the current
  // user's role), so without this ref the effect would keep calling the
  // FIRST render's `onPush` forever — silently refetching the wrong query
  // if the role wasn't settled yet on that first render.
  const onPushRef = useRef(onPush);
  useEffect(() => { onPushRef.current = onPush; }, [onPush]);

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

        onPushRef.current();
      });
    });

    return () => unsubscribe();
  }, []);
}
