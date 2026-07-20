import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { notificationsApi } from '@/shared/services/notifications.service';
import { playNotificationSound } from '@/shared/utils/sound.utils';
import { parseBackendTimestamp } from '@/shared/utils/date.utils';
import { enrichLeaveNotification } from '@/shared/utils/notificationDisplay.utils';
import type { AppNotification } from '@/shared/types/notification.types';
import type { NotificationsPage } from '@/shared/services/notifications.service';

const PAGE_SIZE = 15;

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

function flattenPages(pages: NotificationsPage[] | undefined): AppNotification[] {
  return (pages ?? []).flatMap((page) => page.data ?? []);
}

function nextPageParam(lastPage: NotificationsPage): number | undefined {
  const current = Number(lastPage.current_page ?? 1);
  const last = Number(lastPage.last_page ?? 1);
  return current < last ? current + 1 : undefined;
}

export function useNotifications() {
  const qc   = useQueryClient();
  const { user, hasPermission } = useAuth();
  const { lang } = useLang();
  const role = user?.role;
  const actor = user?.actor;
  const isAr = lang === 'ar';
  const queryKey = ['notifications', role, actor] as const;
  const hrQueryKey = ['notifications', 'hr', 'admin-merge'] as const;

  const shouldMergeHrNotifications =
    role === 'admin' && hasPermission('view-leave');

  const primaryQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      notificationsApi.list(role, { per_page: PAGE_SIZE, page: pageParam }, actor)
        .then((r) => r.data.data),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    staleTime: 15_000,
    /* Polling fallback when FCM is unavailable — keeps badge close to real-time.
     * Must keep polling in background tabs too, otherwise a hidden tab never
     * learns about new notifications (and so never raises a desktop notification)
     * until the user switches back — react-query pauses refetchInterval in the
     * background by default. */
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  });

  const hrQuery = useInfiniteQuery({
    queryKey: hrQueryKey,
    queryFn: ({ pageParam }) =>
      notificationsApi.list('hr', { per_page: PAGE_SIZE, page: pageParam }, 'admin')
        .then((r) => r.data.data),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: shouldMergeHrNotifications,
    staleTime: 15_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  });

  const notifications = useMemo(() => {
    const primary = flattenPages(primaryQuery.data?.pages);
    const merged = shouldMergeHrNotifications
      ? mergeNotifications(primary, flattenPages(hrQuery.data?.pages))
      : primary;

    return merged.map((notification) => enrichLeaveNotification(notification, isAr, role));
  }, [
    primaryQuery.data?.pages,
    hrQuery.data?.pages,
    shouldMergeHrNotifications,
    isAr,
    role,
  ]);

  const unreadCount = useMemo(() => {
    const primaryUnread = primaryQuery.data?.pages[0]?.unreadCount ?? 0;
    if (!shouldMergeHrNotifications) return primaryUnread;

    const mergedUnread = notifications.filter((n) => !n.readAt).length;
    return Math.max(primaryUnread, mergedUnread);
  }, [
    primaryQuery.data?.pages,
    notifications,
    shouldMergeHrNotifications,
  ]);

  const hasNextPage = Boolean(
    primaryQuery.hasNextPage || (shouldMergeHrNotifications && hrQuery.hasNextPage),
  );
  const isFetchingNextPage = primaryQuery.isFetchingNextPage
    || (shouldMergeHrNotifications && hrQuery.isFetchingNextPage);

  async function fetchNextPage() {
    if (primaryQuery.hasNextPage && !primaryQuery.isFetchingNextPage) {
      await primaryQuery.fetchNextPage();
      return;
    }
    if (shouldMergeHrNotifications && hrQuery.hasNextPage && !hrQuery.isFetchingNextPage) {
      await hrQuery.fetchNextPage();
    }
  }

  const prevUnreadCount = useRef<number | null>(null);

  // Bumped only when unread count goes UP from a known baseline — not on
  // first mount (would fire for pre-existing unread) and not on mark-read.
  // Topbar watches this to trigger the bell chime + shake animation.
  const [justArrived, setJustArrived] = useState(0);

  useEffect(() => {
    // Wait for the first real fetch — before that, unreadCount is a
    // loading-placeholder 0 and would falsely look like a jump from 0.
    if (primaryQuery.data === undefined) return;

    if (prevUnreadCount.current !== null && unreadCount > prevUnreadCount.current) {
      playNotificationSound();
      setJustArrived(n => n + 1);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, primaryQuery.data]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(role, id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey });
      if (shouldMergeHrNotifications) {
        qc.invalidateQueries({ queryKey: hrQueryKey });
      }
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await notificationsApi.markAllRead(role);
      if (shouldMergeHrNotifications) {
        await notificationsApi.markAllRead('hr');
      }
    },
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey });
      if (shouldMergeHrNotifications) {
        qc.invalidateQueries({ queryKey: hrQueryKey });
      }
    },
  });

  return {
    notifications,
    unreadCount,
    justArrived,
    isLoading: primaryQuery.isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markRead:      (id: string) => markReadMutation.mutate(id),
    markAllRead:   () => markAllReadMutation.mutate(),
    refetch:       () => {
      qc.invalidateQueries({ queryKey });
      if (shouldMergeHrNotifications) {
        qc.invalidateQueries({ queryKey: hrQueryKey });
      }
    },
  };
}
