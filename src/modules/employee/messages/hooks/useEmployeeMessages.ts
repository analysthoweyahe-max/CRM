import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toChronologicalMessages } from '@/shared/utils/chatNormalize.utils';
import { empMessagesApi } from '../api/messages.api';
import type { EmpMessage } from '../types/messages.types';

/* ── Keys ── */
const CONV_KEY  = ['employee', 'messages', 'conversations'] as const;
const msgKey    = (uuid: string) => ['employee', 'messages', 'messages', uuid] as const;

function appendEmpMessage(prev: EmpMessage[] | undefined, msg: EmpMessage): EmpMessage[] {
  const list = prev ?? [];
  if (list.some(m => String(m.id) === String(msg.id))) return list;
  return [...list, { ...msg, isMine: true }];
}

/* ── Conversations list ── */
export function useEmpConversations(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...CONV_KEY, params],
    queryFn:  () => empMessagesApi.listConversations({ per_page: 15, ...params }),
    select:   res  => res.data.data.data ?? [],
    refetchInterval: 30_000,
    staleTime: 5_000,
  });
}

/* ── Messages in a conversation ── */
export function useEmpMessages(uuid: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!uuid) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [uuid, qc]);

  return useQuery({
    queryKey: msgKey(uuid ?? ''),
    queryFn:  async () => {
      const res = await empMessagesApi.getMessages(uuid!, { per_page: 30, page: 1 });
      // Page 1 = newest first (DESC) → chronological for UI.
      return toChronologicalMessages(res.data.data.data ?? []);
    },
    enabled:  !!uuid,
    refetchInterval: 30_000,
    staleTime: 2_000,
  });
}

/* ── Send text message ── */
export function useEmpSendMessage(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => empMessagesApi.sendMessage(uuid, body),
    onSuccess:  (res) => {
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<EmpMessage[]>(msgKey(uuid), (prev) => appendEmpMessage(prev, msg));
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

/* ── Send media ── */
export function useEmpSendMedia(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => empMessagesApi.sendMedia(uuid, file),
    onSuccess:  (res) => {
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<EmpMessage[]>(msgKey(uuid), (prev) => appendEmpMessage(prev, msg));
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
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
