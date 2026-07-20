import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { extractPaginatedList } from '@/shared/utils/apiList.utils';
import {
  appendThreadMessage,
  mergeChronologicalMessages,
  toChronologicalMessages,
  type MessengerThreadCache,
} from '@/shared/utils/chatNormalize.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { messagesApi } from '../api/messages.api';
import {
  conversationMessageId,
  normalizeApiConversation,
  normalizeApiMessage,
} from '../utils/message.utils';
import type { ApiConversation, ApiEmployeeLookup, ApiMessage } from '../types/messages.types';

const CONV_KEY = ['hr', 'messages', 'conversations'] as const;
const msgKey = (uuid: string) => ['hr', 'messages', 'thread', uuid] as const;
const PAGE_SIZE = 30;

export type HrMessagesCache = MessengerThreadCache<ApiMessage>;

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
  const qc = useQueryClient();
  const [olderMessages, setOlderMessages] = useState<ApiMessage[]>([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);

  useEffect(() => {
    setOlderMessages([]);
    setLoadedPage(1);
    setLastPage(1);
  }, [uuid]);

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

  const query = useQuery({
    queryKey: msgKey(uuid ?? ''),
    queryFn:  async () => {
      const res = await messagesApi.getMessages(uuid!, { per_page: PAGE_SIZE, page: 1 });
      return {
        messages: toChronologicalMessages(
          extractPaginatedList<ApiMessage>(res.data)
            .filter((msg): msg is ApiMessage => !!msg && typeof msg === 'object')
            .map(normalizeApiMessage),
        ),
        lastPage: res.data.data.last_page ?? 1,
      } satisfies HrMessagesCache;
    },
    enabled:  !!uuid,
    retry:    2,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });

  useEffect(() => {
    if (query.data?.lastPage != null) setLastPage(query.data.lastPage);
  }, [query.data?.lastPage]);

  const loadOlder = useCallback(async () => {
    if (!uuid || isFetchingOlder || loadedPage >= lastPage) return;
    const nextPage = loadedPage + 1;
    setIsFetchingOlder(true);
    try {
      const res = await messagesApi.getMessages(uuid, {
        page: nextPage,
        per_page: PAGE_SIZE,
      });
      const batch = toChronologicalMessages(
        extractPaginatedList<ApiMessage>(res.data)
          .filter((msg): msg is ApiMessage => !!msg && typeof msg === 'object')
          .map(normalizeApiMessage),
      );
      setOlderMessages((prev) => [...batch, ...prev]);
      setLoadedPage(nextPage);
      setLastPage(res.data.data.last_page ?? lastPage);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsFetchingOlder(false);
    }
  }, [uuid, isFetchingOlder, loadedPage, lastPage]);

  const recentMessages = query.data?.messages ?? [];
  const messages = useMemo(
    () => mergeChronologicalMessages(olderMessages, recentMessages),
    [olderMessages, recentMessages],
  );

  return {
    ...query,
    data: messages,
    hasMoreOlder: loadedPage < lastPage,
    isFetchingOlder,
    loadOlder,
  };
}

export function useSendMessage(conversation: ApiConversation) {
  const uuid = conversationMessageId(conversation);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => messagesApi.sendMessage(uuid, body),
    onSuccess: (res) => {
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<HrMessagesCache>(msgKey(uuid), (prev) =>
          appendThreadMessage(prev, normalizeApiMessage(msg)),
        );
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
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
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<HrMessagesCache>(msgKey(uuid), (prev) =>
          appendThreadMessage(prev, normalizeApiMessage(msg)),
        );
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
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
