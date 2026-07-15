import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useFirebaseMessaging } from '@/shared/hooks/useFirebaseMessaging';
import { useNotifications } from '@/shared/hooks/useNotifications';
import {
  applyRealtimeMessage,
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
import { getNotificationDisplayText, isLeaveNotificationType } from '@/shared/utils/notificationDisplay.utils';
import { isEmployeeLeaveStatusNotification, isHrLeaveSubmittedNotification, isPersonalAssigneeNotification } from '@/shared/utils/notificationRoleFilter.utils';
import { playNotificationSound } from '@/shared/utils/sound.utils';
import type { AppNotification } from '@/shared/types/notification.types';

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
    if (role === 'admin' || role === 'hr' || role === 'manager' || role === 'seo-leader') {
      if (isEmployeeLeaveStatusNotification(notification)) return false;
      if (isPersonalAssigneeNotification(notification)) return false;
      return true;
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
    qc.invalidateQueries({ queryKey: ['dashboard', 'recent-leaves'] });
    qc.invalidateQueries({ queryKey: ['dashboard', 'pending-leaves'] });
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

    if (isLeaveNotificationType(notification.type)) {
      invalidateLeaveQueries();
    }

    if (isRealtimeMessageType(notification.type)) {
      const data = typeof notification.data === 'object' && notification.data
        ? notification.data
        : {};
      applyRealtimeMessage(qc, { ...data, type: notification.type }, user?.id);
    }
  }

  function handleRealtimeEvent(payload: RealtimeMessagePayload) {
    const title = String(
      payload.title
      ?? (isAr ? 'إشعار جديد' : 'New notification'),
    );
    const body = String(payload.body ?? '');
    const dedupKey = realtimeDedupKey(payload, title, body);

    const now = Date.now();
    if (lastRealtimeRef.current?.key === dedupKey && now - lastRealtimeRef.current.at < 5_000) {
      applyRealtimeMessage(qc, payload, user?.id);
      handlePushRefresh();
      return;
    }
    lastRealtimeRef.current = { key: dedupKey, at: now };

    const result = applyRealtimeMessage(qc, payload, user?.id);

    if (result.skippedOwn || result.isUpdate) {
      handlePushRefresh();
      return;
    }

    if (wasNotificationToasted(dedupKey)) {
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
      type:      String(payload.type || ''),
      title,
      body,
      data:      payload as Record<string, unknown>,
      readAt:    null,
      createdAt,
    };

    if (!shouldShowForRole(fakeNotification)) {
      markNotificationToasted(notificationId);
      if (notificationId !== dedupKey) markNotificationToasted(dedupKey);
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

    if (isLeaveNotificationType(fakeNotification.type)) {
      invalidateLeaveQueries();
    }

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

    if (isRealtimeMessageType(realtime.type)) {
      handleRealtimeEvent(realtime);
      return;
    }

    const notificationId = readFcmField(data, 'id');
    const dedupKey = notificationId || `${title}::${body}`;

    const now = Date.now();
    if (lastRealtimeRef.current?.key === dedupKey && now - lastRealtimeRef.current.at < 5_000) {
      handlePushRefresh();
      return;
    }
    lastRealtimeRef.current = { key: dedupKey, at: now };

    if (wasNotificationToasted(dedupKey)) {
      handlePushRefresh();
      return;
    }

    if (notificationId) seenIdsRef.current.add(notificationId);

    const createdAt = readFcmField(data, 'created_at')
      || readFcmField(data, 'createdAt')
      || new Date().toISOString();

    const fakeNotification: AppNotification = {
      id:        notificationId || 'fcm',
      type:      String(data.type || ''),
      title:     String(title),
      body:      String(body || ''),
      data,
      readAt:    null,
      createdAt,
    };

    if (!shouldShowForRole(fakeNotification)) {
      markNotificationToasted(dedupKey);
      if (notificationId) markNotificationToasted(notificationId);
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

    if (isLeaveNotificationType(fakeNotification.type)) {
      invalidateLeaveQueries();
    }

    handlePushRefresh();
  });

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

      // Seed messenger caches from unread message notifications (no toast).
      // Covers the case where the conversations list API failed but FCM/DB
      // already delivered the alert.
      notifications.forEach((n) => {
        if (n.readAt || !isRealtimeMessageType(n.type)) return;
        const data = typeof n.data === 'object' && n.data
          ? n.data
          : (typeof n.data === 'string'
            ? (() => { try { return JSON.parse(n.data) as Record<string, unknown>; } catch { return {}; } })()
            : {});
        applyRealtimeMessage(qc, { ...data, type: n.type, title: n.title, body: n.body }, user?.id);
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
