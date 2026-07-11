import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { extractPaginatedList } from '@/shared/utils/apiList.utils';
import { useEchoLive } from '@/shared/realtime-messages';
import { seoMessagesApi } from '../api/messages.api';
import type {
  CreateSeoGroupPayload,
  ManageSeoGroupMembersPayload,
  SeoConversation,
  SeoConversationType,
  SeoMentionable,
  SeoMessage,
} from '../types/messages.types';

const CONV_KEY = ['seo-member', 'messages', 'conversations'] as const;
const msgKey   = (id: string) => ['seo-member', 'messages', 'messages', id] as const;
const convDetailKey = (id: string) => ['seo-member', 'messages', 'conversation', id] as const;

/** Fast poll while Echo is down; relax when websocket is live. */
function pollMs(echoLive: boolean, openChat: boolean): number {
  if (echoLive) return openChat ? 15_000 : 45_000;
  return openChat ? 2_000 : 5_000;
}

export function useSeoConversations(opts?: { search?: string; type?: SeoConversationType | 'all' }) {
  const type = opts?.type && opts.type !== 'all' ? opts.type : undefined;
  const search = opts?.search?.trim() || undefined;
  const echoLive = useEchoLive();

  return useQuery({
    queryKey: [...CONV_KEY, type ?? 'all', search ?? ''],
    queryFn:  async () => {
      const res = await seoMessagesApi.listConversations({ search, type, per_page: 100 });
      return extractPaginatedList<SeoConversation>(res.data);
    },
    refetchInterval: pollMs(echoLive, false),
    staleTime: 1_000,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}

export function useSeoConversation(conversationId: string | null, enabled = true) {
  return useQuery({
    queryKey: convDetailKey(conversationId ?? ''),
    queryFn:  () => seoMessagesApi.getConversation(conversationId!).then(r => r.data.data),
    enabled:  !!conversationId && enabled,
    staleTime: 5_000,
  });
}

export function useSeoMessages(conversationId: string | null) {
  const qc = useQueryClient();
  const echoLive = useEchoLive();

  useEffect(() => {
    if (!conversationId) return;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      qc.invalidateQueries({ queryKey: msgKey(conversationId) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [conversationId, qc]);

  return useQuery({
    queryKey: msgKey(conversationId ?? ''),
    queryFn:  async () => {
      const res = await seoMessagesApi.getMessages(conversationId!);
      return extractPaginatedList<SeoMessage>(res.data);
    },
    enabled:  !!conversationId,
    // Open chat: 2s fallback when Pusher isn't live; slower when Echo is connected.
    refetchInterval: pollMs(echoLive, true),
    staleTime: 500,
    refetchIntervalInBackground: false,
  });
}

export function useSendSeoMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => seoMessagesApi.sendMessage(conversationId, body),
    onSuccess: (res) => {
      const msg = res.data.data;
      qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) => {
        const list = prev ?? [];
        if (list.some(m => String(m.id) === String(msg.id))) return list;
        return [...list, { ...msg, isMine: true }];
      });
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => {
          if (!prev) return prev;
          const idx = prev.findIndex(c => c.id === conversationId);
          if (idx === -1) return prev;
          const existing = prev[idx]!;
          const updated: SeoConversation = {
            ...existing,
            lastMessage: msg.body ?? existing.lastMessage,
            lastMessageAt: msg.sentAt ?? msg.created_at ?? new Date().toISOString(),
            unreadCount: 0,
          };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        },
      );
    },
  });
}

export function useMarkSeoRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => seoMessagesApi.markRead(conversationId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}

export function useSeoMentionables(enabled: boolean, search?: string) {
  const q = search?.trim() || undefined;
  return useQuery({
    queryKey: ['seo-member', 'messages', 'mentionables', q ?? ''],
    queryFn:  async () => {
      const res = await seoMessagesApi.mentionables(q);
      return extractPaginatedList<SeoMentionable>(res.data);
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateSeoConversation(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { recipient_type: string; recipient_id: string }) =>
      seoMessagesApi.createConversation(payload).then(r => r.data.data),
    onSuccess: (conversation) => {
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => {
          const list = prev ?? [];
          if (list.some(c => c.id === conversation.id)) {
            return [conversation, ...list.filter(c => c.id !== conversation.id)];
          }
          return [conversation, ...list];
        },
      );
      qc.invalidateQueries({ queryKey: CONV_KEY });
      toast.success(isAr ? 'تم فتح المحادثة' : 'Conversation opened');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useCreateSeoGroup(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSeoGroupPayload) =>
      seoMessagesApi.createGroup(payload).then(r => r.data.data),
    onSuccess: (conversation) => {
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => [conversation, ...(prev ?? []).filter(c => c.id !== conversation.id)],
      );
      qc.invalidateQueries({ queryKey: CONV_KEY });
      toast.success(isAr ? 'تم إنشاء الجروب' : 'Group created');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useAddSeoGroupMembers(conversationId: string, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManageSeoGroupMembersPayload) =>
      seoMessagesApi.addMembers(conversationId, payload).then(r => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.setQueryData(convDetailKey(conversationId), data);
      toast.success(isAr ? 'تمت إضافة الأعضاء' : 'Members added');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useRemoveSeoGroupMembers(conversationId: string, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManageSeoGroupMembersPayload) =>
      seoMessagesApi.removeMembers(conversationId, payload).then(r => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.setQueryData(convDetailKey(conversationId), data);
      toast.success(isAr ? 'تمت إزالة العضو' : 'Member removed');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useLeaveSeoGroup(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => seoMessagesApi.leaveGroup(conversationId),
    onSuccess: (_data, conversationId) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.removeQueries({ queryKey: convDetailKey(conversationId) });
      qc.removeQueries({ queryKey: msgKey(conversationId) });
      toast.success(isAr ? 'غادرت الجروب' : 'You left the group');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}
