import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  appendThreadMessage,
  mergeChronologicalMessages,
  toChronologicalMessages,
  type MessengerThreadCache,
} from '@/shared/utils/chatNormalize.utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { empMessagesApi } from '../api/messages.api';
import type { EmpMessage } from '../types/messages.types';

const CONV_KEY = ['employee', 'messages', 'conversations'] as const;
const msgKey = (uuid: string) => ['employee', 'messages', 'messages', uuid] as const;
const PAGE_SIZE = 30;

export type EmpMessagesCache = MessengerThreadCache<EmpMessage>;

export function useEmpConversations(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [...CONV_KEY, params],
    queryFn:  () => empMessagesApi.listConversations({ per_page: 15, ...params }),
    select:   res  => res.data.data.data ?? [],
    refetchInterval: 30_000,
    staleTime: 5_000,
  });
}

export function useEmpMessages(uuid: string | null) {
  const qc = useQueryClient();
  const [olderMessages, setOlderMessages] = useState<EmpMessage[]>([]);
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
      const res = await empMessagesApi.getMessages(uuid!, { per_page: PAGE_SIZE, page: 1 });
      return {
        messages: toChronologicalMessages(res.data.data.data ?? []),
        lastPage: res.data.data.last_page ?? 1,
      } satisfies EmpMessagesCache;
    },
    enabled:  !!uuid,
    refetchInterval: 30_000,
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
      const res = await empMessagesApi.getMessages(uuid, {
        page: nextPage,
        per_page: PAGE_SIZE,
      });
      const batch = toChronologicalMessages(res.data.data.data ?? []);
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

export function useEmpSendMessage(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => empMessagesApi.sendMessage(uuid, body),
    onSuccess:  (res) => {
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<EmpMessagesCache>(msgKey(uuid), (prev) =>
          appendThreadMessage(prev, { ...msg, isMine: true }),
        );
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

export function useEmpSendMedia(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => empMessagesApi.sendMedia(uuid, file),
    onSuccess:  (res) => {
      const msg = res.data?.data;
      if (msg?.id) {
        qc.setQueryData<EmpMessagesCache>(msgKey(uuid), (prev) =>
          appendThreadMessage(prev, { ...msg, isMine: true }),
        );
      } else {
        qc.invalidateQueries({ queryKey: msgKey(uuid) });
      }
      qc.invalidateQueries({ queryKey: CONV_KEY });
    },
  });
}

export function useEmpMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => empMessagesApi.markRead(uuid),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}
