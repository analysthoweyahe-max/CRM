import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { notificationsApi } from '@/shared/services/notifications.service';

export function useNotifications() {
  const qc   = useQueryClient();
  const role = useAuth().user?.role;
  const queryKey = ['notifications', role] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn:  () => notificationsApi.list(role, { per_page: 15 }).then((r) => r.data.data),
    staleTime: 30_000,
    /* TODO(backend): remove once FCM push delivery is confirmed reliable end-to-end.
       Right now the bell only updates when a foreground push fires `refetch()` — if the
       push never arrives (token registration failing, Firebase plan/billing issues, etc.)
       new notifications never show up without a manual reload. This poll is a resilient
       fallback so the badge stays close to real-time either way. */
    refetchInterval: 15_000,
  });

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
    unreadCount:   data?.unreadCount ?? 0,
    isLoading,
    markRead:      (id: string) => markReadMutation.mutate(id),
    markAllRead:   () => markAllReadMutation.mutate(),
    refetch:       () => qc.invalidateQueries({ queryKey }),
  };
}
