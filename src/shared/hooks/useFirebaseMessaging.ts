import { useEffect, useRef } from 'react';
import type { MessagePayload } from 'firebase/messaging';
import { onMessage } from 'firebase/messaging';
import { env } from '@/app/config/env';
import { getMessagingInstance } from '@/shared/lib/firebase';

type FcmPayload = MessagePayload & { notification?: { title?: string; body?: string } };

/** onPush fires when a push arrives — show toast + refetch the notifications list. */
export function useFirebaseMessaging(onPush: (payload: FcmPayload) => void) {
  const onPushRef = useRef(onPush);
  useEffect(() => { onPushRef.current = onPush; }, [onPush]);

  useEffect(() => {
    if (!('Notification' in window)) return;

    let unsubscribe = () => {};

    getMessagingInstance().then(messaging => {
      if (!messaging) return;

      unsubscribe = onMessage(messaging, payload => {
        if (env.isDev) console.log('[FCM] foreground message', payload);
        onPushRef.current(payload as FcmPayload);
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'FCM_BACKGROUND_MESSAGE') return;
      if (env.isDev) console.log('[FCM] background message forwarded', event.data);
      onPushRef.current((event.data.payload ?? {}) as FcmPayload);
    };

    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage);
  }, []);
}
