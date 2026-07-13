import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { mapProjectMessage } from '@/shared/utils/projectChat.utils';
import { empProjectMessagesApi } from '../api/projectMessages.api';
import type { ChatMessage, PmMentionable } from '../types/projectMessage.types';

export function useProjectMessages(projectId: string) {
  const { user } = useAuth();
  const [text,   setText]   = useState('');
  const [search, setSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: mentionables = [] } = useQuery({
    queryKey: ['emp-project-mentionables', projectId],
    queryFn:  () => empProjectMessagesApi.mentionables(projectId).then(r => r.data.data),
    enabled:  showMentions && !!projectId,
    staleTime: 60_000,
  });

  function insertMention(m: PmMentionable) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${m.name} `);
    setShowMentions(false);
  }

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['emp-project-messages', projectId, search],
    queryFn:  () => empProjectMessagesApi.list(projectId, { per_page: 30, search: search.trim() || undefined })
      .then(r => r.data.data.data.map(m => mapProjectMessage(m, user?.id) as ChatMessage)),
    refetchInterval: 5_000,
    enabled: !!projectId,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (payload: { body?: string; file?: File }) =>
      empProjectMessagesApi.send(projectId, payload),
    onSuccess: () => {
      setSendError(null);
      queryClient.invalidateQueries({ queryKey: ['emp-project-messages', projectId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSendError(msg ?? 'Send failed');
    },
  });

  function send(file?: File) {
    const trimmed = text.trim();
    if ((!trimmed && !file) || sendMutation.isPending) return;
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
    isLoading, sendError, isSending: sendMutation.isPending,
    showMentions, setShowMentions, mentionables, insertMention,
  };
}
