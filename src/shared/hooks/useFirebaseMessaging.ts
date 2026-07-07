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
            // TEMP debug aid — copy this value to test pushes against the
            // actual browser token instead of guessing which device a
            // token in Firebase/DB belongs to. Remove once FCM is confirmed stable.
            console.log('[FCM] Web Token:', token);
            notificationsApi.registerToken(token, 'web').catch(console.error);
          }
        }).catch(console.error);
      });

      unsubscribe = onMessage(messaging, payload => {
        // TEMP debug aid — remove once realtime is confirmed stable.
        console.log('[FCM] foreground message received', payload);

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

  // `onMessage()` above only fires while this tab is the focused/foreground
  // one at the moment the push arrives — otherwise the browser routes it to
  // the service worker's onBackgroundMessage (public/firebase-messaging-sw.js),
  // which shows a native OS notification but has no way to reach an open
  // page on its own. The SW forwards those pushes here via postMessage so
  // the dashboard still refetches even when it wasn't the active tab.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onSwMessage = (event: MessageEvent) => {
      // TEMP debug aid — remove once realtime is confirmed stable.
      console.log('[FCM] message from service worker', event.data);
      if (event.data?.type === 'FCM_BACKGROUND_MESSAGE') onPushRef.current();
    };
    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage);
  }, []);
}
