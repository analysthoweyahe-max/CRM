import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoMessagesApi } from '../api/messages.api';

const CONV_KEY = ['seo-member', 'messages', 'conversations'] as const;
const msgKey   = (id: string) => ['seo-member', 'messages', 'messages', id] as const;

export function useSeoConversations(search?: string) {
  return useQuery({
    queryKey: [...CONV_KEY, search ?? ''],
    queryFn:  () => seoMessagesApi.listConversations(search ? { search } : undefined),
    select:   res => res.data.data.data ?? [],
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useSeoMessages(conversationId: string | null) {
  return useQuery({
    queryKey: msgKey(conversationId ?? ''),
    queryFn:  () => seoMessagesApi.getMessages(conversationId!),
    select:   res => res.data.data.data ?? [],
    enabled:  !!conversationId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

export function useSendSeoMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => seoMessagesApi.sendMessage(conversationId, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: msgKey(conversationId) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
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
  return useQuery({
    queryKey: ['seo-member', 'messages', 'mentionables', search ?? ''],
    queryFn:  () => seoMessagesApi.mentionables(search).then(r => r.data.data.data ?? []),
    enabled,
    staleTime: 60_000,
  });
}
