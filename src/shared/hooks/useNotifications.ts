import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { notificationsApi } from '@/shared/services/notifications.service';
import { playNotificationSound } from '@/shared/utils/sound.utils';

export function useNotifications() {
  const qc   = useQueryClient();
  const role = useAuth().user?.role;
  const queryKey = ['notifications', role] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn:  () => notificationsApi.list(role, { per_page: 15 }).then((r) => r.data.data),
    staleTime: 30_000,
    /* Polling fallback when FCM is unavailable — keeps badge close to real-time. */
    refetchInterval: 30_000,
  });

  const unreadCount     = data?.unreadCount ?? 0;
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
    notifications: data?.data ?? [],
    unreadCount,
    justArrived,
    isLoading,
    markRead:      (id: string) => markReadMutation.mutate(id),
    markAllRead:   () => markAllReadMutation.mutate(),
    refetch:       () => qc.invalidateQueries({ queryKey }),
  };
}
