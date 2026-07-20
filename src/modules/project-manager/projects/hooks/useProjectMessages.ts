import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { mapProjectMessage } from '@/shared/utils/projectChat.utils';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { excludeSelfFromActors, filterPmProjectMentions, toChronologicalMessages } from '@/shared/utils/chatNormalize.utils';
import { pmProjectMessagesApi } from '../api/messages.api';
import type { ChatMessage, PmMentionable } from '../types/message.types';

export function useProjectMessages(projectId: string) {
  const { user, isSuperAdmin } = useAuth();
  const canSend = !isSuperAdmin;
  const [text,   setText]   = useState('');
  const [search, setSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: mentionables = [] } = useQuery({
    queryKey: ['pm-project-mentionables', projectId],
    queryFn:  () => pmProjectMessagesApi.mentionables(projectId)
      .then(r => filterPmProjectMentions(
        excludeSelfFromActors(toApiArray<PmMentionable>(r.data.data), user),
      )),
    enabled:  showMentions && !!projectId,
    staleTime: 60_000,
  });

  function insertMention(m: PmMentionable) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${m.name} `);
    setShowMentions(false);
  }

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['pm-project-messages', projectId, search],
    queryFn:  async () => {
      const rows = await pmProjectMessagesApi.list(projectId, {
        page: 1,
        per_page: 30,
        search: search.trim() || undefined,
      }).then(r => r.data.data.data.map(m => mapProjectMessage(m, user?.id) as ChatMessage));
      return toChronologicalMessages(rows);
    },
    refetchInterval: 5_000,
    enabled: !!projectId,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (payload: { body?: string; file?: File }) =>
      pmProjectMessagesApi.send(projectId, payload),
    onSuccess: (res) => {
      setSendError(null);
      const raw = res.data?.data;
      if (raw) {
        const mapped = mapProjectMessage(raw, user?.id) as ChatMessage;
        queryClient.setQueryData<ChatMessage[]>(
          ['pm-project-messages', projectId, search],
          (prev) => {
            const list = prev ?? [];
            if (list.some(m => m.id === mapped.id)) return list;
            return [...list, mapped];
          },
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['pm-project-messages', projectId] });
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
      if (msg?.status === 403) {
        setSendError('read_only');
        return;
      }
      setSendError(msg?.data?.message ?? 'Send failed');
    },
  });

  function send(file?: File) {
    const trimmed = text.trim();
    if ((!trimmed && !file) || sendMutation.isPending || !canSend) return;
    setText('');
    sendMutation.mutate({ body: trimmed || undefined, file });
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    send(file);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return {
    filtered: messages,
    text, setText, search, setSearch, send, handleKey, handleFile, bottomRef, fileRef,
    isLoading, canSend, sendError, isSending: sendMutation.isPending,
    showMentions, setShowMentions, mentionables, insertMention,
  };
}
