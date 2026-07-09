import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empMessagesApi } from '../api/messages.api';

/* ── Keys ── */
const CONV_KEY  = ['employee', 'messages', 'conversations'] as const;
const msgKey    = (uuid: string) => ['employee', 'messages', 'messages', uuid] as const;

/* ── Conversations list (polls every 10 s) ── */
export function useEmpConversations(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...CONV_KEY, params],
    queryFn:  () => empMessagesApi.listConversations({ per_page: 15, ...params }),
    select:   res  => res.data.data.data ?? [],
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

/* ── Messages in a conversation (polls every 5 s when active) ── */
export function useEmpMessages(uuid: string | null) {
  return useQuery({
    queryKey: msgKey(uuid ?? ''),
    queryFn:  () => empMessagesApi.getMessages(uuid!, { per_page: 30 }),
    select:   res  => (res.data.data.data ?? []).slice().reverse(), // oldest first
    enabled:  !!uuid,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

/* ── Send text message ── */
export function useEmpSendMessage(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => empMessagesApi.sendMessage(uuid, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

/* ── Send media ── */
export function useEmpSendMedia(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => empMessagesApi.sendMedia(uuid, file),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

/* ── Mark as read (fire-and-forget) ── */
export function useEmpMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => empMessagesApi.markRead(uuid),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}
