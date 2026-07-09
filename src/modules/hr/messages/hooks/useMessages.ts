import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractPaginatedList } from '@/shared/utils/apiList.utils';
import { messagesApi } from '../api/messages.api';
import {
  conversationMessageId,
  normalizeApiConversation,
  normalizeApiMessage,
} from '../utils/message.utils';
import type { ApiConversation, ApiEmployeeLookup, ApiMessage } from '../types/messages.types';

const CONV_KEY = ['hr', 'messages', 'conversations'] as const;
const msgKey = (uuid: string) => ['hr', 'messages', 'thread', uuid] as const;

function parseMessagesResponse(
  res: Awaited<ReturnType<typeof messagesApi.getMessages>>,
): ApiMessage[] {
  return extractPaginatedList<ApiMessage>(res.data)
    .filter((msg): msg is ApiMessage => !!msg && typeof msg === 'object')
    .map(normalizeApiMessage)
    .slice()
    .reverse(); // oldest first
}

function appendMessage(prev: ApiMessage[] | undefined, msg: ApiMessage): ApiMessage[] {
  const normalized = normalizeApiMessage(msg);
  const list = prev ?? [];
  if (list.some(m => String(m.id) === String(normalized.id))) return list;
  return [...list, normalized];
}

export function useConversations(params?: { status?: string; search?: string; per_page?: number }) {
  return useQuery({
    queryKey:        [...CONV_KEY, params],
    queryFn:         () => messagesApi.listConversations(params).then(r =>
      extractPaginatedList<ApiConversation>(r.data).map(normalizeApiConversation),
    ),
    refetchInterval: 30_000,
  });
}

export function useSearchEmployees(search: string) {
  return useQuery({
    queryKey: ['hr', 'messages', 'employees', search],
    queryFn:  () => messagesApi.searchEmployees({ search, limit: 15 }).then(r => extractPaginatedList<ApiEmployeeLookup>(r.data)),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) =>
      messagesApi.createConversation({ employee_id: employeeId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}

export function useMessages(conversation: ApiConversation | null) {
  const uuid = conversation ? conversationMessageId(conversation) : null;

  return useQuery({
    queryKey: msgKey(uuid ?? ''),
    queryFn:  () => messagesApi.getMessages(uuid!, { per_page: 30 }),
    select:   parseMessagesResponse,
    enabled:  !!uuid,
    retry:    2,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}

export function useSendMessage(conversation: ApiConversation) {
  const uuid = conversationMessageId(conversation);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => messagesApi.sendMessage(uuid, body),
    onSuccess: (res) => {
      qc.setQueryData<ApiMessage[]>(msgKey(uuid), (prev) =>
        appendMessage(prev, res.data.data),
      );
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

export function useSendMedia(conversation: ApiConversation) {
  const uuid = conversationMessageId(conversation);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => messagesApi.sendMedia(uuid, file),
    onSuccess: (res) => {
      qc.setQueryData<ApiMessage[]>(msgKey(uuid), (prev) =>
        appendMessage(prev, res.data.data),
      );
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => messagesApi.markRead(uuid),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}

export function useUpdateConversationStatus(conversation: ApiConversation) {
  const uuid = conversationMessageId(conversation);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (status: 'open' | 'closed') => messagesApi.updateStatus(uuid, status),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.invalidateQueries({ queryKey: msgKey(uuid) });
    },
  });
}
