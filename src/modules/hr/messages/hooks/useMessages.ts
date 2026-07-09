import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { messagesApi } from '../api/messages.api';
import type { ApiConversation, ApiEmployeeLookup, ApiMessage } from '../types/messages.types';

const CONV_KEY = ['conversations'];
const msgKey = (uuid: string) => ['conversations', uuid, 'messages'];

export function useConversations(params?: { status?: string; search?: string; per_page?: number }) {
  return useQuery({
    queryKey:        [...CONV_KEY, params],
    // Defensive: normalize whether the backend returns a flat array or a
    // paginated `{ data: [...] }` wrapper for this endpoint.
    queryFn:         () => messagesApi.listConversations(params).then(r => toApiArray<ApiConversation>(r.data.data)),
    refetchInterval: 30_000,
  });
}

export function useSearchEmployees(search: string) {
  return useQuery({
    queryKey: ['messages', 'employees', search],
    queryFn:  () => messagesApi.searchEmployees({ search, limit: 15 }).then(r => toApiArray<ApiEmployeeLookup>(r.data.data)),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) =>
      messagesApi.createConversation({ participant_id: participantId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}

/* ── Messages in a conversation (polls every 5s while open) ── */
export function useMessages(uuid: string | null) {
  return useQuery({
    queryKey: msgKey(uuid ?? ''),
    queryFn:  () => messagesApi.getMessages(uuid!, { per_page: 30 })
      .then(r => toApiArray<ApiMessage>(r.data.data).slice().reverse()), // oldest first
    enabled:  !!uuid,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

export function useSendMessage(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => messagesApi.sendMessage(uuid, body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: msgKey(uuid) }),
  });
}

export function useSendMedia(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => messagesApi.sendMedia(uuid, file),
    onSuccess:  () => qc.invalidateQueries({ queryKey: msgKey(uuid) }),
  });
}

/* ── Mark as read (fire-and-forget) ── */
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => messagesApi.markRead(uuid),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}
