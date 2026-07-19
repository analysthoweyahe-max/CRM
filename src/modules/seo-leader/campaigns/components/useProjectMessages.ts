import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient }     from '@tanstack/react-query';
import { campaignApi }                               from '../api/campaign.api';
import type { SeoMessage, Mentionable }              from '../api/campaign.api';
import { useAuth }                                   from '@/modules/auth/context/AuthContext';
import { excludeSelfFromActors }                     from '@/shared/utils/chatNormalize.utils';
import { toApiArray }                                from '@/shared/utils/apiList.utils';

export function useProjectMessages(projectId: string) {
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);

  const [search,       setSearch]       = useState('');
  const [text,         setText]         = useState('');
  const [apiError,     setApiError]     = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionRefs,  setMentionRefs]  = useState<Mentionable[]>([]);

  /* ── Messages list ───────────────────────────────────────────────────── */
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['seo-messages', projectId, search],
    queryFn:  () =>
      campaignApi.getMessages(projectId, search ? { search } : undefined)
        .then(r => toApiArray<SeoMessage>(r.data.data)),
    refetchInterval: 10_000,
    staleTime:       5_000,
  });

  const messages: SeoMessage[] = messagesData ?? [];

  /* ── Mentionables ────────────────────────────────────────────────────── */
  const { data: mentionablesRaw } = useQuery({
    queryKey: ['seo-mentionables', projectId],
    queryFn:  () =>
      campaignApi.getMentionables(projectId)
        .then(r => excludeSelfFromActors(toApiArray<Mentionable>(r.data.data), user)),
    staleTime: 60_000,
  });

  const mentionables: Mentionable[] = mentionablesRaw ?? [];

  const filteredMentions = mentionQuery
    ? mentionables.filter(m =>
        m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : mentionables;

  /* ── Send text message ───────────────────────────────────────────────── */
  const sendMutation = useMutation({
    mutationFn: ({ content, mentions }: { content: string; mentions?: Array<{ type: string; id: string }> }) =>
      campaignApi.sendMessage(projectId, content, mentions),
    onSuccess: (res) => {
      const msg = res.data.data;
      if (msg) {
        queryClient.setQueryData(
          ['seo-messages', projectId, search],
          (old: SeoMessage[] | undefined) => [...(old ?? []), msg],
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['seo-messages', projectId] });
      }
      setText('');
      setMentionRefs([]);
      setApiError(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'حدث خطأ أثناء إرسال الرسالة';
      setApiError(msg);
    },
  });

  /* ── Send file/image ─────────────────────────────────────────────────── */
  const fileMutation = useMutation({
    mutationFn: (file: File) => campaignApi.sendMedia(projectId, file),
    onSuccess: (res) => {
      const msg = res.data.data;
      if (msg) {
        queryClient.setQueryData(
          ['seo-messages', projectId, search],
          (old: SeoMessage[] | undefined) => [...(old ?? []), msg],
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['seo-messages', projectId] });
      }
      setApiError(null);
    },
    onError: (err: unknown) => {
      const res = (err as { response?: { data?: unknown; status?: number } })?.response;
      console.error('[fileMutation error]', res?.status, JSON.stringify(res?.data));
      const data = res?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
      const errMsg = data?.message
        ?? Object.values(data?.errors ?? {}).flat()[0]
        ?? 'حدث خطأ أثناء رفع الملف';
      setApiError(errMsg);
    },
  });

  /* ── Auto scroll to bottom on new messages ───────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* ── @ mention detection ─────────────────────────────────────────────── */
  const handleTextChange = useCallback((val: string) => {
    setText(val);
    setApiError(null);
    const lastAt = val.lastIndexOf('@');
    if (lastAt === -1) {
      setShowMentions(false);
      return;
    }
    const afterAt = val.slice(lastAt + 1);
    if (afterAt.includes(' ')) {
      setShowMentions(false);
    } else {
      setShowMentions(true);
      setMentionQuery(afterAt);
    }
  }, []);

  const insertMention = useCallback((m: Mentionable) => {
    setText(prev => {
      const lastAt = prev.lastIndexOf('@');
      return prev.slice(0, lastAt) + `@${m.name} `;
    });
    setMentionRefs(prev => (prev.some(r => r.id === m.id) ? prev : [...prev, m]));
    setShowMentions(false);
    setMentionQuery('');
  }, []);

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const content = text.trim();
    if (!content || sendMutation.isPending) return;
    const mentions = mentionRefs
      .filter(m => content.includes(`@${m.name}`))
      .map(m => ({ type: m.type ?? 'employee', id: m.id }));
    sendMutation.mutate({ content, mentions });
  }, [text, sendMutation, mentionRefs]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const openFilePicker = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const sendFile = useCallback((file: File) => {
    fileMutation.mutate(file);
  }, [fileMutation]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendFile(file);
    e.target.value = '';
  }, [sendFile]);

  const openMention = useCallback(() => {
    setText(prev => {
      const next = prev.endsWith(' ') || prev === '' ? prev + '@' : prev + ' @';
      handleTextChange(next);
      return next;
    });
  }, [handleTextChange]);

  return {
    messages,
    isLoading,
    currentUserId:   user?.id ?? '',
    search,          setSearch,
    text,            handleTextChange, handleKeyDown, handleSend,
    isSending:       sendMutation.isPending || fileMutation.isPending,
    apiError,
    showMentions,
    mentionables,
    filteredMentions, insertMention,
    openMention,
    openFilePicker,  handleFileChange, sendFile,
    fileRef,
    bottomRef,
  };
}
