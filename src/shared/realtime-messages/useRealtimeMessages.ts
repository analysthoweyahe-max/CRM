import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { env } from '@/app/config/env';
import {
  getEcho,
  isEchoConfigured,
  markEchoSubscribeError,
  markEchoSubscribed,
  subscribeEchoStatus,
  isEchoLive,
} from './echo';
import type { RealtimeMessagePayload } from './messageRealtime.types';
import { parseRealtimeMessagePayload } from './refreshRealtimeMessages';

/**
 * Pusher Echo listener:
 * Echo.private(`user.${actor}.${uuid}`).listen('.message.sent', handler)
 *
 * Tracks subscription health so open chats can fall back to fast polling.
 */
export function useRealtimeMessages(
  onMessage: (payload: RealtimeMessagePayload) => void,
) {
  const { user } = useAuth();
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!isEchoConfigured() || !user?.id || !user.actor) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `user.${user.actor}.${user.id}`;
    const channel = echo.private(channelName);

    // laravel-echo / pusher-js subscription callbacks
    const pusherChannel = (channel as unknown as {
      subscription?: {
        bind?: (event: string, cb: (data?: unknown) => void) => void;
      };
    }).subscription;

    channel.subscribed(() => {
      if (env.isDev) console.log('[Echo] subscribed', channelName);
      markEchoSubscribed();
    });

    channel.error((err: unknown) => {
      if (env.isDev) console.warn('[Echo] subscribe error', channelName, err);
      markEchoSubscribeError();
    });

    // Some pusher-js versions expose auth failure on the underlying channel.
    pusherChannel?.bind?.('pusher:subscription_error', (err: unknown) => {
      if (env.isDev) console.warn('[Echo] pusher:subscription_error', err);
      markEchoSubscribeError();
    });
    pusherChannel?.bind?.('pusher:subscription_succeeded', () => {
      markEchoSubscribed();
    });

    channel.listen('.message.sent', (event: RealtimeMessagePayload) => {
      if (env.isDev) console.log('[Echo] message.sent', event);
      markEchoSubscribed();
      onMessageRef.current(parseRealtimeMessagePayload(event));
    });

    return () => {
      try {
        channel.stopListening('.message.sent');
        echo.leave(channelName);
      } catch {
        /* ignore teardown errors */
      }
    };
  }, [user?.id, user?.actor]);
}

/** Subscribe to Echo health for adaptive polling intervals. */
export function useEchoLive(): boolean {
  const [live, setLive] = useState(isEchoLive);

  useEffect(() => {
    return subscribeEchoStatus((status) => {
      setLive(status === 'connected');
    });
  }, []);

  return live;
}
