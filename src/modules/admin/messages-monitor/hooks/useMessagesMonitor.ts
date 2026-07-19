import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { extractPaginatedList } from '@/shared/utils/apiList.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { useRealtimeMessages } from '@/shared/realtime-messages';
import type { RealtimeMessagePayload } from '@/shared/realtime-messages/messageRealtime.types';
import { messagesMonitorApi } from '../api/monitor.api';
import type { ApiMonitoredMessage, MonitoredConversation } from '../types/monitor.types';
import {
  applyRealtimeToConversations,
  normalizeMessengerConversations,
  normalizeMonitoredMessages,
  partiesLabel,
  sortMessagesChronological,
} from '../utils/monitor.utils';

const CONV_KEY = ['admin', 'messages-monitor', 'conversations'] as const;

export function useMessagesMonitor(isAr: boolean) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const {
    data: conversations = [],
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: [...CONV_KEY, search],
    queryFn:  async () => {
      const res = await messagesMonitorApi.listConversations({
        search: search.trim() || undefined,
        per_page: 100,
      });
      // Keep ALL rows including isObserver=true — no observer filter.
      const list = normalizeMessengerConversations(extractPaginatedList(res.data));
      return list.sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt.replace(' ', 'T')).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt.replace(' ', 'T')).getTime() : 0;
        return tb - ta;
      });
    },
    staleTime: 5_000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const selectedId = activeConversation?.id ?? null;

  const { data: threadMessages = [], isLoading: loadingThread, isError: threadError } = useQuery({
    queryKey: ['admin', 'messages-monitor', 'thread', selectedId],
    queryFn:  async (): Promise<ApiMonitoredMessage[]> => {
      if (!selectedId) return [];
      const res = await messagesMonitorApi.listMessages(selectedId, { per_page: 100 });
      return sortMessagesChronological(
        normalizeMonitoredMessages(extractPaginatedList(res.data)).map((m) => ({
          ...m,
          conversationId: selectedId,
          conversationName: activeConversation
            ? (partiesLabel(activeConversation.parties, isAr) || activeConversation.name)
            : undefined,
        })),
      );
    },
    enabled: !!selectedId,
    staleTime: 2_000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const onRealtime = useCallback((payload: RealtimeMessagePayload) => {
    if (payload.type !== 'seo_direct_message') return;

    const conversationId = payload.conversationId
      ? String(payload.conversationId)
      : undefined;

    qc.setQueryData<MonitoredConversation[]>([...CONV_KEY, search], (prev) => {
      if (!prev) {
        void qc.invalidateQueries({ queryKey: CONV_KEY });
        return prev;
      }
      const next = applyRealtimeToConversations(prev, {
        conversationId,
        body: typeof payload.messageBody === 'string'
          ? payload.messageBody
          : (typeof payload.message_body === 'string'
            ? payload.message_body
            : (typeof payload.preview === 'string'
              ? payload.preview
              : (typeof payload.body === 'string' ? payload.body : undefined))),
        isObserver: typeof payload.isObserver === 'boolean'
          ? payload.isObserver
          : undefined,
      });
      if (conversationId && !prev.some((c) => c.id === conversationId)) {
        void qc.invalidateQueries({ queryKey: CONV_KEY });
      }
      return next;
    });

    if (conversationId && conversationId === selectedId) {
      void qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor', 'thread', selectedId] });
    }
  }, [qc, search, selectedId]);

  // Echo.private('user.admin.' + adminUuid).listen('.message.sent', ...)
  useRealtimeMessages(onRealtime);

  function selectConversation(conv: MonitoredConversation) {
    setActiveConversationId(conv.id);
  }

  const errorMessage = isError
    ? (extractApiError(error) || (isAr ? 'تعذّر تحميل المحادثات' : 'Failed to load conversations'))
    : null;

  return {
    conversations,
    activeConversation,
    threadMessages,
    isLoading,
    loadingThread,
    isFetching,
    isError,
    threadError,
    errorMessage,
    search,
    setSearch,
    selectConversation,
    refetch,
    partiesLabel: (c: MonitoredConversation) => partiesLabel(c.parties, isAr),
  };
}
