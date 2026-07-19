import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useFirebaseMessaging } from '@/shared/hooks/useFirebaseMessaging';
import { useNotifications } from '@/shared/hooks/useNotifications';
import {
  applyRealtimeMessage,
  isChatBubbleType,
  isNotificationOnlyType,
  isRealtimeMessageType,
  parseRealtimeMessagePayload,
  useRealtimeMessages,
  type RealtimeMessagePayload,
} from '@/shared/realtime-messages';
import { showInAppNotification } from '@/shared/utils/notificationToast.utils';
import {
  isRecentlyCreated,
  markNotificationToasted,
  markNotificationsToasted,
  wasNotificationToasted,
} from '@/shared/utils/notificationSeen.store';
import { resolveNotificationPath } from '@/shared/utils/notificationNavigation.utils';
import {
  getNotificationDisplayText,
  isAttendanceExceptionNotificationType,
  isLeaveNotificationType,
} from '@/shared/utils/notificationDisplay.utils';
import { isEmployeeLeaveStatusNotification, isHrLeaveSubmittedNotification, isPersonalAssigneeNotification } from '@/shared/utils/notificationRoleFilter.utils';
import { playNotificationSound } from '@/shared/utils/sound.utils';
import type { AppNotification } from '@/shared/types/notification.types';

function isToastOnlyRealtimeType(type: string | undefined | null): boolean {
  return isNotificationOnlyType(type);
}

function canApplyAsChat(type: string | undefined | null): boolean {
  return isRealtimeMessageType(type) && isChatBubbleType(type) && !isToastOnlyRealtimeType(type);
}

function readFcmField(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === 'string' ? v : '';
}

function realtimeDedupKey(payload: RealtimeMessagePayload, title: string, body: string): string {
  return payload.messageId
    || readFcmField(payload as Record<string, unknown>, 'id')
    || `${payload.type ?? ''}::${payload.conversationId ?? payload.projectId ?? ''}::${title}::${body}`;
}

/** Listens for FCM + Echo + polling; applies realtime chat updates and toasts. */
export function NotificationListener() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { notifications, refetch } = useNotifications();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);
  const lastRealtimeRef = useRef<{ key: string; at: number } | null>(null);

  function shouldShowForRole(notification: AppNotification): boolean {
    // Employee sessions always receive personal assignment alerts.
    if (user?.actor === 'employee') {
      return !isHrLeaveSubmittedNotification(notification);
    }
    const role = user?.role;
    if (!role) return true;
    // Admin/HR mirrors must not toast employee-personal assignment alerts.
    if (role === 'admin' || role === 'hr') {
      if (isEmployeeLeaveStatusNotification(notification)) return false;
      if (isPersonalAssigneeNotification(notification)) return false;
      return true;
    }
    // PM / SEO leaders own their portal notifications — including task assigned.
    if (role === 'manager' || role === 'seo-leader') {
      return !isEmployeeLeaveStatusNotification(notification);
    }
    if (role === 'employee' || role === 'seo-member') {
      return !isHrLeaveSubmittedNotification(notification);
    }
    return true;
  }

  function navigateTo(notification: AppNotification) {
    const path = resolveNotificationPath(notification, user);
    if (path) navigate(path);
  }

  function handlePushRefresh() {
    refetch();
    qc.invalidateQueries({ queryKey: ['my-tasks'] });
  }

  function invalidateLeaveQueries() {
    qc.invalidateQueries({ queryKey: ['leaves'] });
    qc.invalidateQueries({ queryKey: ['employee', 'leave'] });
    qc.invalidateQueries({ queryKey: ['seo-member', 'leave'] });
    qc.invalidateQueries({ queryKey: ['dashboard', 'recent-leaves'] });
    qc.invalidateQueries({ queryKey: ['dashboard', 'pending-leaves'] });
  }

  function invalidateExceptionQueries() {
    qc.invalidateQueries({ queryKey: ['attendance', 'exceptions'] });
  }

  function invalidateHrActivityQueries(type: string) {
    if (isLeaveNotificationType(type)) invalidateLeaveQueries();
    if (isAttendanceExceptionNotificationType(type)) invalidateExceptionQueries();
  }

  function showForNotification(notification: AppNotification) {
    if (!shouldShowForRole(notification)) return;
    if (wasNotificationToasted(notification.id)) return;

    seenIdsRef.current.add(notification.id);

    const display = getNotificationDisplayText(notification, isAr, user?.role);

    const shown = showInAppNotification({
      id:        notification.id,
      title:     display.title,
      body:      display.body,
      createdAt: notification.createdAt,
      isAr,
      onView: () => navigateTo(notification),
    });

    if (shown) playNotificationSound();

    invalidateHrActivityQueries(notification.type);

    if (canApplyAsChat(notification.type)) {
      const data = typeof notification.data === 'object' && notification.data
        ? notification.data
        : {};
      // Pass chat ids from data only — never seed bubble text from notification title/body.
      applyRealtimeMessage(qc, { ...data, type: notification.type }, user?.id);
    }
  }

  function handleRealtimeEvent(payload: RealtimeMessagePayload) {
    const title = String(
      payload.title
      ?? (isAr ? 'إشعار جديد' : 'New notification'),
    );
    const body = String(payload.body ?? '');
    const type = String(payload.type ?? '');
    const dedupKey = realtimeDedupKey(payload, title, body);

    const now = Date.now();
    if (lastRealtimeRef.current?.key === dedupKey && now - lastRealtimeRef.current.at < 5_000) {
      if (canApplyAsChat(type)) {
        applyRealtimeMessage(qc, payload, user?.id);
      }
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }
    lastRealtimeRef.current = { key: dedupKey, at: now };

    // HR leave/exception / request payloads may also arrive on `.message.sent` —
    // treat them as notifications, never as chat messages.
    const result = canApplyAsChat(type)
      ? applyRealtimeMessage(qc, payload, user?.id)
      : { handled: false, chatOpen: false, skippedOwn: false as const };

    if (result.skippedOwn || result.isUpdate) {
      handlePushRefresh();
      return;
    }

    if (wasNotificationToasted(dedupKey)) {
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }

    const notificationId = readFcmField(payload as Record<string, unknown>, 'id') || dedupKey;
    seenIdsRef.current.add(notificationId);

    // Open chat already updated via append — skip toast.
    if (result.chatOpen) {
      markNotificationToasted(notificationId);
      if (notificationId !== dedupKey) markNotificationToasted(dedupKey);
      handlePushRefresh();
      return;
    }

    const createdAt = readFcmField(payload as Record<string, unknown>, 'created_at')
      || readFcmField(payload as Record<string, unknown>, 'createdAt')
      || new Date().toISOString();

    const fakeNotification: AppNotification = {
      id:        notificationId || 'realtime',
      type,
      title,
      body,
      data:      payload as Record<string, unknown>,
      readAt:    null,
      createdAt,
    };

    if (!shouldShowForRole(fakeNotification)) {
      markNotificationToasted(notificationId);
      if (notificationId !== dedupKey) markNotificationToasted(dedupKey);
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }

    const display = getNotificationDisplayText(fakeNotification, isAr, user?.role);

    const shown = showInAppNotification({
      id:        notificationId || dedupKey,
      dedupKeys: [notificationId, dedupKey].filter(Boolean),
      title:     display.title,
      body:      display.body || undefined,
      createdAt,
      isAr,
      onView: () => navigateTo(fakeNotification),
    });

    if (shown) playNotificationSound();

    invalidateHrActivityQueries(type);
    handlePushRefresh();
  }

  useFirebaseMessaging((payload) => {
    const data = (payload?.data ?? {}) as Record<string, unknown>;
    const title = payload?.notification?.title
      ?? (typeof data.title === 'string' ? data.title : undefined)
      ?? (isAr ? 'إشعار جديد' : 'New notification');
    const body = payload?.notification?.body
      ?? (typeof data.body === 'string' ? data.body : '')
      ?? '';

    const realtime = parseRealtimeMessagePayload({
      ...data,
      title: String(title),
      body:  String(body || ''),
    });

    // Chat messages + request/alert types (leave/exception/instruction) share the same handler.
    if (isRealtimeMessageType(realtime.type) || isToastOnlyRealtimeType(realtime.type)) {
      handleRealtimeEvent(realtime);
      return;
    }

    const notificationId = readFcmField(data, 'id');
    const dedupKey = notificationId || `${title}::${body}`;
    const type = String(data.type || '');

    const now = Date.now();
    if (lastRealtimeRef.current?.key === dedupKey && now - lastRealtimeRef.current.at < 5_000) {
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }
    lastRealtimeRef.current = { key: dedupKey, at: now };

    if (wasNotificationToasted(dedupKey)) {
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }

    if (notificationId) seenIdsRef.current.add(notificationId);

    const createdAt = readFcmField(data, 'created_at')
      || readFcmField(data, 'createdAt')
      || new Date().toISOString();

    const fakeNotification: AppNotification = {
      id:        notificationId || 'fcm',
      type,
      title:     String(title),
      body:      String(body || ''),
      data,
      readAt:    null,
      createdAt,
    };

    if (!shouldShowForRole(fakeNotification)) {
      markNotificationToasted(dedupKey);
      if (notificationId) markNotificationToasted(notificationId);
      invalidateHrActivityQueries(type);
      handlePushRefresh();
      return;
    }

    const display = getNotificationDisplayText(fakeNotification, isAr, user?.role);

    const shown = showInAppNotification({
      id:        notificationId || dedupKey,
      dedupKeys: [notificationId, dedupKey].filter(Boolean),
      title:     display.title,
      body:      display.body || undefined,
      createdAt,
      isAr,
      onView: () => navigateTo(fakeNotification),
    });

    if (shown) playNotificationSound();

    invalidateHrActivityQueries(type);
    handlePushRefresh();
  });

  // Cold-start / background OS notification click → navigate in-app.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'FCM_NOTIFICATION_CLICK') return;
      const path = typeof event.data.path === 'string' ? event.data.path : '';
      if (!path) return;

      if (path.startsWith('/')) {
        navigate(path);
        return;
      }

      // Prefer resolving with auth user when SW only forwarded raw FCM data.
      const data = (event.data.data ?? {}) as Record<string, unknown>;
      const fake: AppNotification = {
        id:        String(data.id ?? 'fcm-click'),
        type:      String(data.type ?? ''),
        title:     String(data.title ?? ''),
        body:      String(data.body ?? ''),
        data,
        readAt:    null,
        createdAt: new Date().toISOString(),
      };
      navigateTo(fake);
    };

    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage);
  }, [navigate, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeMessages((payload) => {
    handleRealtimeEvent(payload);
  });

  useEffect(() => {
    if (!notifications.length && !initialisedRef.current) return;

    const allIds = notifications.map(n => n.id);

    if (!initialisedRef.current) {
      markNotificationsToasted(allIds);
      seenIdsRef.current = new Set(allIds);
      initialisedRef.current = true;

      // Seed messenger caches from unread chat notifications (no toast).
      // Never pass notification title/body as bubble text ("رسالة جديدة").
      notifications.forEach((n) => {
        if (n.readAt || !canApplyAsChat(n.type)) return;
        const data = typeof n.data === 'object' && n.data
          ? n.data
          : (typeof n.data === 'string'
            ? (() => { try { return JSON.parse(n.data) as Record<string, unknown>; } catch { return {}; } })()
            : {});
        applyRealtimeMessage(qc, { ...data, type: n.type }, user?.id);
      });
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
