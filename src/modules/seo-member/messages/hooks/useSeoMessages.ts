import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { extractApiError, extractEditApiError, extractApiStatus } from '@/shared/utils/error.utils';
import { extractPaginatedList } from '@/shared/utils/apiList.utils';
import { useEchoLive } from '@/shared/realtime-messages';
import { conversationLastMessagePreview } from '@/shared/utils/messagePreview.utils';
import { excludeSelfFromActors, normalizeSeoMessage } from '@/shared/utils/chatNormalize.utils';
import { seoMessagesApi } from '../api/messages.api';
import type {
  CreateSeoGroupPayload,
  ManageSeoGroupMembersPayload,
  SeoConversation,
  SeoConversationType,
  SeoMentionable,
  SeoMessage,
  SendSeoMessagePayload,
  UpdateSeoMessagePayload,
} from '../types/messages.types';

const CONV_KEY = ['seo-member', 'messages', 'conversations'] as const;
const msgKey   = (id: string) => ['seo-member', 'messages', 'messages', id] as const;
const convDetailKey = (id: string) => ['seo-member', 'messages', 'conversation', id] as const;

/** Fast poll while Echo is down; relax when websocket is live. */
function pollMs(echoLive: boolean, openChat: boolean): number {
  if (echoLive) return openChat ? 15_000 : 45_000;
  return openChat ? 2_000 : 5_000;
}

export function useSeoConversations(opts?: { search?: string; type?: SeoConversationType | 'all' }) {
  const type = opts?.type && opts.type !== 'all' ? opts.type : undefined;
  const search = opts?.search?.trim() || undefined;
  const echoLive = useEchoLive();

  return useQuery({
    queryKey: [...CONV_KEY, type ?? 'all', search ?? ''],
    queryFn:  async () => {
      const res = await seoMessagesApi.listConversations({ search, type, per_page: 100 });
      return extractPaginatedList<SeoConversation>(res.data);
    },
    refetchInterval: pollMs(echoLive, false),
    staleTime: 1_000,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}

export function useSeoConversation(conversationId: string | null, enabled = true) {
  return useQuery({
    queryKey: convDetailKey(conversationId ?? ''),
    queryFn:  () => seoMessagesApi.getConversation(conversationId!).then(r => r.data.data),
    enabled:  !!conversationId && enabled,
    staleTime: 5_000,
  });
}

export function useSeoMessages(conversationId: string | null) {
  const qc = useQueryClient();
  const echoLive = useEchoLive();

  useEffect(() => {
    if (!conversationId) return;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      qc.invalidateQueries({ queryKey: msgKey(conversationId) });
      qc.invalidateQueries({ queryKey: CONV_KEY });
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [conversationId, qc]);

  return useQuery({
    queryKey: msgKey(conversationId ?? ''),
    queryFn:  async () => {
      const res = await seoMessagesApi.getMessages(conversationId!);
      return extractPaginatedList<SeoMessage>(res.data).map((m) => normalizeSeoMessage(m));
    },
    enabled:  !!conversationId,
    // Open chat: 2s fallback when Pusher isn't live; slower when Echo is connected.
    refetchInterval: pollMs(echoLive, true),
    staleTime: 500,
    refetchIntervalInBackground: false,
  });
}

export function useSendSeoMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendSeoMessagePayload | string) =>
      seoMessagesApi.sendMessage(conversationId, payload),
    onSuccess: (res) => {
      const msg = res.data.data;
      qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) => {
        const list = prev ?? [];
        if (list.some(m => String(m.id) === String(msg.id))) return list;
        return [...list, { ...msg, isMine: true }];
      });
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => {
          if (!prev) return prev;
          const idx = prev.findIndex(c => c.id === conversationId);
          if (idx === -1) return prev;
          const existing = prev[idx]!;
          const preview = conversationLastMessagePreview(msg, existing.lastMessage);
          const updated: SeoConversation = {
            ...existing,
            lastMessage: preview,
            lastMessageAt: msg.sentAt ?? msg.created_at ?? new Date().toISOString(),
            unreadCount: 0,
          };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        },
      );
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useEditSeoMessage(conversationId: string, isAr = false) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: number | string; payload: UpdateSeoMessagePayload }) =>
      seoMessagesApi.updateMessage(conversationId, messageId, payload),
    onMutate: async ({ messageId, payload }) => {
      await qc.cancelQueries({ queryKey: msgKey(conversationId) });
      const previous = qc.getQueryData<SeoMessage[]>(msgKey(conversationId));
      const editedAt = new Date().toISOString();
      qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) => {
        if (!prev) return prev;
        return prev.map(m =>
          String(m.id) === String(messageId)
            ? {
                ...m,
                body: payload.body,
                mentions: payload.mentions ?? m.mentions,
                isEdited: true,
                editedAt,
              }
            : m,
        );
      });
      return { previous, messageId, editedAt, body: payload.body };
    },
    onSuccess: (res, vars, ctx) => {
      const msg = normalizeSeoMessage(res.data.data);
      qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) => {
        if (!prev) return prev;
        return prev.map(m => (String(m.id) === String(msg.id ?? vars.messageId) ? { ...m, ...msg } : m));
      });

      // Sidebar preview when the edited message is the latest in the thread.
      const thread = qc.getQueryData<SeoMessage[]>(msgKey(conversationId));
      const last = thread?.[thread.length - 1];
      if (last && String(last.id) === String(msg.id ?? vars.messageId)) {
        const preview = conversationLastMessagePreview(msg, msg.body ?? vars.payload.body);
        qc.setQueriesData<SeoConversation[]>(
          { queryKey: CONV_KEY },
          (prev) => {
            if (!prev) return prev;
            const idx = prev.findIndex(c => c.id === conversationId);
            if (idx === -1) return prev;
            const existing = prev[idx]!;
            const updated: SeoConversation = { ...existing, lastMessage: preview };
            return prev.map((c, i) => (i === idx ? updated : c));
          },
        );
      }

      // Dedupe key for realtime: keep editedAt from server when available.
      void ctx;
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(msgKey(conversationId), ctx.previous);
      }
      const status = extractApiStatus(err);
      if (status === 404) {
        qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) =>
          prev?.filter(m => String(m.id) !== String(vars.messageId)),
        );
      }
      toast.error(extractEditApiError(err, { isAr, kind: 'message' }));
    },
  });
}

export function useReactSeoMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: number | string; emoji: string }) =>
      seoMessagesApi.reactToMessage(conversationId, messageId, emoji),
    onSuccess: (res) => {
      const updated = res.data.data;
      qc.setQueryData<SeoMessage[]>(msgKey(conversationId), (prev) => {
        if (!prev) return prev;
        return prev.map(m => (String(m.id) === String(updated.id) ? { ...m, ...updated } : m));
      });
      // Some backends return only the reaction payload — refresh thread as fallback.
      if (!updated?.id) {
        qc.invalidateQueries({ queryKey: msgKey(conversationId) });
      }
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useMarkSeoRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => seoMessagesApi.markRead(conversationId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CONV_KEY }),
  });
}

export function useSeoMentionables(
  enabled: boolean,
  search?: string,
  options?: { excludeSelf?: boolean },
) {
  const { user } = useAuth();
  const excludeSelf = options?.excludeSelf !== false;
  const q = search?.trim() || undefined;
  return useQuery({
    queryKey: [
      'seo-member', 'messages', 'mentionables', q ?? '',
      excludeSelf ? 'no-self' : 'all',
      user?.id ?? '', user?.employeeId ?? '',
    ],
    queryFn:  async () => {
      const res = await seoMessagesApi.mentionables(q);
      const list = extractPaginatedList<SeoMentionable>(res.data);
      return excludeSelf ? excludeSelfFromActors(list, user) : list;
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateSeoConversation(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { recipient_type: string; recipient_id: string }) =>
      seoMessagesApi.createConversation(payload).then(r => r.data.data),
    onSuccess: (conversation) => {
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => {
          const list = prev ?? [];
          if (list.some(c => c.id === conversation.id)) {
            return [conversation, ...list.filter(c => c.id !== conversation.id)];
          }
          return [conversation, ...list];
        },
      );
      qc.invalidateQueries({ queryKey: CONV_KEY });
      toast.success(isAr ? 'تم فتح المحادثة' : 'Conversation opened');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useCreateSeoGroup(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSeoGroupPayload) =>
      seoMessagesApi.createGroup(payload).then(r => r.data.data),
    onSuccess: (conversation) => {
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: CONV_KEY },
        (prev) => [conversation, ...(prev ?? []).filter(c => c.id !== conversation.id)],
      );
      qc.invalidateQueries({ queryKey: CONV_KEY });
      toast.success(isAr ? 'تم إنشاء الجروب' : 'Group created');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useAddSeoGroupMembers(conversationId: string, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManageSeoGroupMembersPayload) =>
      seoMessagesApi.addMembers(conversationId, payload).then(r => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.setQueryData(convDetailKey(conversationId), data);
      toast.success(isAr ? 'تمت إضافة الأعضاء' : 'Members added');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useRemoveSeoGroupMembers(conversationId: string, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManageSeoGroupMembersPayload) =>
      seoMessagesApi.removeMembers(conversationId, payload).then(r => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.setQueryData(convDetailKey(conversationId), data);
      toast.success(isAr ? 'تمت إزالة العضو' : 'Member removed');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useAssignSeoGroupManagers(conversationId: string, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManageSeoGroupMembersPayload) =>
      seoMessagesApi.assignManagers(conversationId, payload).then(r => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.setQueryData(convDetailKey(conversationId), data);
      toast.success(isAr ? 'تم تعيين المدير' : 'Manager assigned');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}

export function useLeaveSeoGroup(isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => seoMessagesApi.leaveGroup(conversationId),
    onSuccess: (_data, conversationId) => {
      qc.invalidateQueries({ queryKey: CONV_KEY });
      qc.removeQueries({ queryKey: convDetailKey(conversationId) });
      qc.removeQueries({ queryKey: msgKey(conversationId) });
      toast.success(isAr ? 'غادرت الجروب' : 'You left the group');
    },
    onError: (err) => toast.error(extractApiError(err)),
  });
}
