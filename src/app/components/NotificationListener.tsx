import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useFirebaseMessaging } from '@/shared/hooks/useFirebaseMessaging';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { showInAppNotification } from '@/shared/utils/notificationToast.utils';
import {
  isRecentlyCreated,
  markNotificationToasted,
  markNotificationsToasted,
  wasNotificationToasted,
} from '@/shared/utils/notificationSeen.store';
import { resolveNotificationPath } from '@/shared/utils/notificationNavigation.utils';
import type { AppNotification } from '@/shared/types/notification.types';

function readFcmField(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === 'string' ? v : '';
}

/** Listens for FCM + polling and shows visible in-page notification toasts. */
export function NotificationListener() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { notifications, refetch } = useNotifications();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);
  const lastFcmRef = useRef<{ key: string; at: number } | null>(null);

  function navigateTo(notification: AppNotification) {
    const path = resolveNotificationPath(notification, user);
    if (path) navigate(path);
  }

  function showForNotification(notification: AppNotification) {
    if (wasNotificationToasted(notification.id)) return;

    markNotificationToasted(notification.id);
    seenIdsRef.current.add(notification.id);

    showInAppNotification({
      id:     notification.id,
      title:  notification.title,
      body:   notification.body,
      isAr,
      onView: () => navigateTo(notification),
    });
  }

  function handlePushRefresh() {
    refetch();
    qc.invalidateQueries({ queryKey: ['my-tasks'] });
  }

  useFirebaseMessaging((payload) => {
    const data = (payload?.data ?? {}) as Record<string, unknown>;
    const title = payload?.notification?.title
      ?? data.title
      ?? (isAr ? 'إشعار جديد' : 'New notification');
    const body = payload?.notification?.body ?? data.body ?? '';
    const notificationId = readFcmField(data, 'id');
    const dedupKey = notificationId || `${title}::${body}`;

    // Ignore duplicate FCM delivery (foreground + service worker)
    const now = Date.now();
    if (lastFcmRef.current?.key === dedupKey && now - lastFcmRef.current.at < 5_000) {
      handlePushRefresh();
      return;
    }
    lastFcmRef.current = { key: dedupKey, at: now };

    if (wasNotificationToasted(dedupKey)) {
      handlePushRefresh();
      return;
    }

    if (notificationId) {
      markNotificationToasted(notificationId);
      seenIdsRef.current.add(notificationId);
    } else {
      markNotificationToasted(dedupKey);
    }

    showInAppNotification({
      id:    notificationId || dedupKey,
      title: String(title),
      body:  typeof body === 'string' ? body : undefined,
      isAr,
      onView: () => {
        const fakeNotification: AppNotification = {
          id:        notificationId || 'fcm',
          type:      String(data.type || ''),
          title:     String(title),
          body:      String(body || ''),
          data,
          readAt:    null,
          createdAt: new Date().toISOString(),
        };
        navigateTo(fakeNotification);
      },
    });

    handlePushRefresh();
  });

  // Toast only when polling reveals a genuinely new notification
  useEffect(() => {
    if (!notifications.length && !initialisedRef.current) return;

    const allIds = notifications.map(n => n.id);

    if (!initialisedRef.current) {
      markNotificationsToasted(allIds);
      seenIdsRef.current = new Set(allIds);
      initialisedRef.current = true;
      return;
    }

    const prev = seenIdsRef.current;
    const newcomers = notifications.filter(n =>
      !prev.has(n.id)
      && !n.readAt
      && !wasNotificationToasted(n.id)
      && isRecentlyCreated(n.createdAt),
    );

    notifications.forEach(n => prev.add(n.id));

    newcomers.forEach(showForNotification);
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
