import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { notificationsApi } from '@/shared/services/notifications.service';
import { playNotificationSound } from '@/shared/utils/sound.utils';
import { parseBackendTimestamp } from '@/shared/utils/date.utils';
import { enrichLeaveNotification } from '@/shared/utils/notificationDisplay.utils';
import type { AppNotification } from '@/shared/types/notification.types';

function mergeNotifications(primary: AppNotification[], secondary: AppNotification[]): AppNotification[] {
  const seen = new Set<string>();
  const merged: AppNotification[] = [];

  for (const item of [...primary, ...secondary]) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged.sort(
    (a, b) => parseBackendTimestamp(b.createdAt).getTime() - parseBackendTimestamp(a.createdAt).getTime(),
  );
}

export function useNotifications() {
  const qc   = useQueryClient();
  const { user, hasPermission } = useAuth();
  const { lang } = useLang();
  const role = user?.role;
  const actor = user?.actor;
  const isAr = lang === 'ar';
  const queryKey = ['notifications', role, actor] as const;

  const shouldMergeHrNotifications =
    role === 'admin' && hasPermission('view-leave');

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn:  () => notificationsApi.list(role, { per_page: 15 }, actor).then((r) => r.data.data),
    staleTime: 15_000,
    /* Polling fallback when FCM is unavailable — keeps badge close to real-time. */
    refetchInterval: 15_000,
  });

  const { data: hrNotificationsPage } = useQuery({
    queryKey: ['notifications', 'hr', 'admin-merge'],
    queryFn:  () => notificationsApi.list('hr', { per_page: 15 }, 'admin').then((r) => r.data.data),
    enabled:  shouldMergeHrNotifications,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

  const notifications = useMemo(
    () => {
      const merged = shouldMergeHrNotifications
        ? mergeNotifications(data?.data ?? [], hrNotificationsPage?.data ?? [])
        : (data?.data ?? []);

      return merged.map((notification) => enrichLeaveNotification(notification, isAr, role));
    },
    [data?.data, hrNotificationsPage?.data, shouldMergeHrNotifications, isAr, role],
  );

  const unreadCount = useMemo(() => {
    if (!shouldMergeHrNotifications) return data?.unreadCount ?? 0;

    const primaryUnread = data?.unreadCount ?? 0;
    const mergedUnread  = notifications.filter((n) => !n.readAt).length;
    return Math.max(primaryUnread, mergedUnread);
  }, [data?.unreadCount, notifications, shouldMergeHrNotifications]);

  const prevUnreadCount = useRef<number | null>(null);

  // Bumped only when unread count goes UP from a known baseline — not on
  // first mount (would fire for pre-existing unread) and not on mark-read.
  // Topbar watches this to trigger the bell chime + shake animation.
  const [justArrived, setJustArrived] = useState(0);

  useEffect(() => {
    if (prevUnreadCount.current !== null && unreadCount > prevUnreadCount.current) {
      playNotificationSound();
      setJustArrived(n => n + 1);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(role, id),
    onSuccess:  () => qc.invalidateQueries({ queryKey }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(role),
    onSuccess:  () => qc.invalidateQueries({ queryKey }),
  });

  return {
    notifications,
    unreadCount,
    justArrived,
    isLoading,
    markRead:      (id: string) => markReadMutation.mutate(id),
    markAllRead:   () => markAllReadMutation.mutate(),
    refetch:       () => {
      qc.invalidateQueries({ queryKey });
      if (shouldMergeHrNotifications) {
        qc.invalidateQueries({ queryKey: ['notifications', 'hr', 'admin-merge'] });
      }
    },
  };
}
