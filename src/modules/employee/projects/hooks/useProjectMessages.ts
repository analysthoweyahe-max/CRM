import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { getAvatarColor } from '@/shared/utils';
import { empProjectMessagesApi } from '../api/projectMessages.api';
import type { ChatMessage, PmMessage, PmMentionable } from '../types/projectMessage.types';

function toChatMessage(m: PmMessage, currentUserId: string | undefined): ChatMessage {
  const time = m.createdAt.split(' ')[1]?.slice(0, 5) ?? '';
  return {
    id:            String(m.id),
    senderName:    m.sender.name,
    senderInitial: m.sender.avatarInitial,
    senderColor:   getAvatarColor(m.sender.name),
    text:          m.body,
    time,
    isOwn:         !!currentUserId && m.sender.id === currentUserId,
    isRead:        true,
  };
}

export function useProjectMessages(projectId: string) {
  const { user }   = useAuth();
  const [text,   setText]   = useState('');
  const [search, setSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const bottomRef            = useRef<HTMLDivElement>(null);
  const queryClient          = useQueryClient();

  const { data: mentionables = [] } = useQuery({
    queryKey: ['emp-project-mentionables', projectId],
    queryFn:  () => empProjectMessagesApi.mentionables(projectId).then(r => r.data.data.data),
    enabled:  showMentions && !!projectId,
    staleTime: 60_000,
  });

  function insertMention(m: PmMentionable) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${m.name} `);
    setShowMentions(false);
  }

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['emp-project-messages', projectId],
    queryFn:  () => empProjectMessagesApi.list(projectId)
      .then(r => r.data.data.data.map(m => toChatMessage(m, user?.id))),
    refetchInterval: 5_000,
    enabled: !!projectId,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filtered = search.trim()
    ? messages.filter(m => m.text.includes(search.trim()))
    : messages;

  const sendMutation = useMutation({
    mutationFn: (body: string) => empProjectMessagesApi.send(projectId, body),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['emp-project-messages', projectId] }),
  });

  function send() {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    sendMutation.mutate(trimmed);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return {
    filtered, text, setText, search, setSearch, send, handleKey, bottomRef, isLoading,
    showMentions, setShowMentions, mentionables, insertMention,
  };
}
