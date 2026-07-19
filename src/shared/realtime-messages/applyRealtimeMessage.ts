import type { QueryClient } from '@tanstack/react-query';
import type { SeoConversation, SeoMessage } from '@/modules/seo-member/messages/types/messages.types';
import type { RealtimeMessagePayload } from './messageRealtime.types';
import {
  isChatBubbleType,
  isNotificationOnlyType,
  isRealtimeMessageType,
  isRealtimeMessageUpdatedType,
} from './messageRealtime.types';
import { isConversationOpen } from './activeConversation.store';
import {
  isRealtimeChatOpen,
  parseRealtimeMessagePayload,
  refreshRealtimeMessages,
} from './refreshRealtimeMessages';
import {
  normalizeEditedAt,
  normalizeIsEdited,
  normalizeMentions,
} from '@/shared/utils/chatNormalize.utils';
import { conversationLastMessagePreview } from '@/shared/utils/messagePreview.utils';

export const COMPANY_CONV_KEY = ['seo-member', 'messages', 'conversations'] as const;
export const companyMsgKey = (id: string) => ['seo-member', 'messages', 'messages', id] as const;

type CompanyMessagesCache = {
  messages: SeoMessage[];
  lastPage: number;
};

function readCachedMessages(cache: CompanyMessagesCache | SeoMessage[] | undefined): SeoMessage[] {
  if (!cache) return [];
  if (Array.isArray(cache)) return cache;
  return cache.messages ?? [];
}

function writeCachedMessages(
  prev: CompanyMessagesCache | SeoMessage[] | undefined,
  messages: SeoMessage[],
): CompanyMessagesCache {
  if (prev && !Array.isArray(prev)) {
    return { ...prev, messages };
  }
  return { messages, lastPage: 1 };
}

const HR_CONV_KEY = ['hr', 'messages', 'conversations'] as const;
const hrMsgKey = (id: string) => ['hr', 'messages', 'thread', id] as const;
const EMP_HR_CONV_KEY = ['employee', 'messages', 'conversations'] as const;
const empHrMsgKey = (id: string) => ['employee', 'messages', 'messages', id] as const;

function senderId(payload: RealtimeMessagePayload): string | undefined {
  if (!payload.sender) return undefined;
  if (typeof payload.sender === 'string') return undefined;
  return payload.sender.id ? String(payload.sender.id) : undefined;
}

function senderName(payload: RealtimeMessagePayload): string {
  if (!payload.sender || typeof payload.sender === 'string') return '';
  return payload.sender.name ?? '';
}

function senderType(payload: RealtimeMessagePayload): string | undefined {
  if (!payload.sender || typeof payload.sender === 'string') return undefined;
  return payload.sender.type;
}

/** Generic notification titles that must never become chat bubble text. */
const GENERIC_NOTIFICATION_TITLES = new Set([
  'رسالة جديدة',
  'new message',
  'إشعار جديد',
  'new notification',
]);

function isGenericNotificationCopy(text: string): boolean {
  return GENERIC_NOTIFICATION_TITLES.has(text.trim().toLowerCase());
}

/**
 * Chat bubble text from Echo — prefer messageBody / preview.
 * Never use title ("رسالة جديدة"). Toast may still use title/body separately.
 */
function messageBodyFromPayload(payload: RealtimeMessagePayload): string {
  const candidates = [
    payload.messageBody,
    payload.message_body,
    payload.preview,
    payload.body,
  ];
  for (const candidate of candidates) {
    const raw = String(candidate ?? '').trim();
    if (!raw || isGenericNotificationCopy(raw)) continue;
    const name = senderName(payload);
    if (name && raw.startsWith(`${name}:`)) {
      const stripped = raw.slice(name.length + 1).trim();
      if (stripped && !isGenericNotificationCopy(stripped)) return stripped;
    }
    return raw;
  }
  return '';
}

function resolveIsMine(
  payload: RealtimeMessagePayload,
  currentUserId: string | undefined,
): boolean {
  if (payload.isMine === true || payload.echoToSender === true) return true;
  if (!currentUserId) return false;
  const id = senderId(payload);
  return !!id && id === currentUserId;
}

function upsertCompanyConversation(
  prev: SeoConversation[] | undefined,
  payload: RealtimeMessagePayload,
  opts: { isOpen: boolean; body: string },
): SeoConversation[] {
  const conversationId = payload.conversationId;
  if (!conversationId) return prev ?? [];

  const list = prev ?? [];
  const idx = list.findIndex(c => c.id === conversationId);
  const now = new Date().toISOString();

  if (idx === -1) {
    // Do not invent a fake sidebar row (empty / red placeholder) — caller refetches list.
    return list;
  }

  const existing = list[idx]!;
  const updated: SeoConversation = {
    ...existing,
    lastMessage: opts.body || existing.lastMessage,
    lastMessageAt: now,
    unreadCount: opts.isOpen ? 0 : (existing.unreadCount ?? 0) + 1,
    type: (payload.conversationType as SeoConversation['type']) || existing.type,
    name: payload.conversationName ?? existing.name,
  };

  return [updated, ...list.filter((_, i) => i !== idx)];
}

function patchConversationLastMessage(
  prev: SeoConversation[] | undefined,
  conversationId: string,
  body: string,
): SeoConversation[] {
  if (!prev) return prev ?? [];
  const idx = prev.findIndex(c => c.id === conversationId);
  if (idx === -1) return prev;
  const existing = prev[idx]!;
  const updated: SeoConversation = {
    ...existing,
    lastMessage: body || existing.lastMessage,
  };
  return prev.map((c, i) => (i === idx ? updated : c));
}

function resolveUpdatedMessageId(payload: RealtimeMessagePayload): string | undefined {
  const mid = payload.messageId ?? payload.id;
  return mid != null && mid !== '' ? String(mid) : undefined;
}

/**
 * Patch an existing company messenger bubble from `.message.updated`.
 * Dedupes by messageId + editedAt when the optimistic update already applied.
 */
function applyCompanyMessengerUpdate(
  qc: QueryClient,
  payload: RealtimeMessagePayload,
): { handled: boolean; chatOpen: boolean } {
  const conversationId = payload.conversationId ? String(payload.conversationId) : undefined;
  const messageId = resolveUpdatedMessageId(payload);

  if (!conversationId || !messageId) {
    if (conversationId) {
      void qc.refetchQueries({ queryKey: companyMsgKey(conversationId), type: 'active' });
    } else {
      qc.invalidateQueries({ queryKey: COMPANY_CONV_KEY });
    }
    return { handled: true, chatOpen: false };
  }

  const chatOpen = isConversationOpen(conversationId, 'company')
    || qc.getQueryCache().findAll({ queryKey: companyMsgKey(conversationId), type: 'active' }).length > 0;

  const body = messageBodyFromPayload(payload);
  const editedAt = normalizeEditedAt(payload as { editedAt?: string | null; edited_at?: string | null });
  const isEdited = normalizeIsEdited(payload as {
    isEdited?: boolean | null;
    is_edited?: boolean | null;
    editedAt?: string | null;
    edited_at?: string | null;
  }) || true;
  const mentions = normalizeMentions(payload.mentions);

  const existingList = readCachedMessages(
    qc.getQueryData<CompanyMessagesCache | SeoMessage[]>(companyMsgKey(conversationId)),
  );
  const existing = existingList.find(m => String(m.id) === messageId);

  // Already applied (e.g. optimistic HTTP success) — skip duplicate patch.
  if (
    existing
    && isEdited
    && editedAt
    && (existing.editedAt === editedAt || existing.edited_at === editedAt)
    && (body === '' || existing.body === body)
  ) {
    return { handled: true, chatOpen };
  }

  if (!existingList.length || !existing) {
    // Partial / missing local cache → refetch active thread only.
    void qc.refetchQueries({ queryKey: companyMsgKey(conversationId), type: 'active' });
  } else {
    const patched: SeoMessage = {
      ...existing,
      ...(body ? { body } : {}),
      isEdited: true,
      editedAt: editedAt ?? existing.editedAt ?? new Date().toISOString(),
      ...(mentions ? { mentions: mentions as SeoMessage['mentions'] } : {}),
    };
    qc.setQueryData<CompanyMessagesCache | SeoMessage[]>(companyMsgKey(conversationId), (prev) => {
      const list = readCachedMessages(prev);
      return writeCachedMessages(
        prev,
        list.map(m => (String(m.id) === messageId ? patched : m)),
      );
    });

    // If this was the latest message, refresh sidebar preview.
    const last = existingList[existingList.length - 1];
    if (last && String(last.id) === messageId) {
      const preview = conversationLastMessagePreview(patched, body || last.body || '…');
      qc.setQueriesData<SeoConversation[]>(
        { queryKey: COMPANY_CONV_KEY },
        (prev) => patchConversationLastMessage(prev, conversationId, preview),
      );
    }
  }

  return { handled: true, chatOpen };
}

function applyCompanyMessenger(
  qc: QueryClient,
  payload: RealtimeMessagePayload,
  currentUserId: string | undefined,
): { handled: boolean; chatOpen: boolean; needsListRefetch: boolean } {
  const conversationId = payload.conversationId ? String(payload.conversationId) : undefined;
  const messageId = payload.messageId ? String(payload.messageId) : undefined;

  // Pure notification-looking payloads without chat ids — never invent bubbles.
  if (!conversationId || !messageId) {
    qc.invalidateQueries({ queryKey: COMPANY_CONV_KEY });
    return { handled: true, chatOpen: false, needsListRefetch: true };
  }

  const body = messageBodyFromPayload(payload);
  const chatOpen = isConversationOpen(conversationId, 'company')
    || qc.getQueryCache().findAll({ queryKey: companyMsgKey(conversationId), type: 'active' }).length > 0;

  const isMine = resolveIsMine(payload, currentUserId);
  const partialBody = body || null;
  const msg: SeoMessage = {
    id:      messageId,
    body:    partialBody,
    type:    typeof payload.messageType === 'string' ? payload.messageType : undefined,
    sender:  {
      id:   senderId(payload) ?? '',
      name: senderName(payload) || '…',
      type: senderType(payload),
    },
    isMine,
    sentAt:  new Date().toISOString(),
  };

  // Append when thread is open/cached; de-dupe by messageId (POST 201 + Echo).
  const hasThreadCache = qc.getQueryData(companyMsgKey(conversationId)) != null;
  if (chatOpen || hasThreadCache) {
    qc.setQueryData<CompanyMessagesCache | SeoMessage[]>(companyMsgKey(conversationId), (prev) => {
      const list = readCachedMessages(prev);
      if (list.some(m => String(m.id) === String(msg.id))) {
        return writeCachedMessages(prev, list);
      }
      return writeCachedMessages(prev, [...list, msg]);
    });
    void qc.refetchQueries({ queryKey: companyMsgKey(conversationId), type: 'active' });
  }

  const listPreview =
    msg.type === 'voice'
      ? 'Voice message'
      : (partialBody || '…');

  const matching = qc.getQueriesData<SeoConversation[]>({ queryKey: COMPANY_CONV_KEY });
  let knownConversation = false;
  for (const [, list] of matching) {
    if (list?.some(c => c.id === conversationId)) {
      knownConversation = true;
      break;
    }
  }

  if (knownConversation) {
    qc.setQueriesData<SeoConversation[]>(
      { queryKey: COMPANY_CONV_KEY },
      (prev) => upsertCompanyConversation(prev, payload, {
        isOpen: chatOpen || isMine,
        body: listPreview,
      }),
    );
  }

  // Soft-refetch sidebar (covers unknown conversations without inventing rows).
  qc.invalidateQueries({ queryKey: COMPANY_CONV_KEY, refetchType: 'none' });
  void qc.refetchQueries({ queryKey: COMPANY_CONV_KEY, type: 'active' });

  return { handled: true, chatOpen: chatOpen || isMine, needsListRefetch: !knownConversation };
}

function applyHrMessenger(
  qc: QueryClient,
  payload: RealtimeMessagePayload,
): { handled: boolean; chatOpen: boolean } {
  const conversationId = payload.conversationId;
  if (!conversationId) {
    qc.invalidateQueries({ queryKey: HR_CONV_KEY });
    qc.invalidateQueries({ queryKey: EMP_HR_CONV_KEY });
    return { handled: true, chatOpen: false };
  }

  const chatOpen = isConversationOpen(conversationId, 'hr')
    || qc.getQueryCache().findAll({ queryKey: hrMsgKey(conversationId), type: 'active' }).length > 0
    || qc.getQueryCache().findAll({ queryKey: empHrMsgKey(conversationId), type: 'active' }).length > 0;

  if (chatOpen) {
    qc.invalidateQueries({ queryKey: hrMsgKey(conversationId) });
    qc.invalidateQueries({ queryKey: empHrMsgKey(conversationId) });
  }
  qc.invalidateQueries({ queryKey: HR_CONV_KEY });
  qc.invalidateQueries({ queryKey: EMP_HR_CONV_KEY });

  return { handled: true, chatOpen };
}

export interface ApplyRealtimeResult {
  handled: boolean;
  chatOpen: boolean;
  skippedOwn: boolean;
  /** True when this was an edit event — callers should skip new-message toasts. */
  isUpdate?: boolean;
}

/**
 * Apply a realtime message event to React Query caches.
 * - Appends echoToSender / isMine echoes into the open thread (de-dupe by messageId vs POST 201)
 * - Never treats notification-only types (leave/request/instruction) as chat bubbles
 * - Upserts known conversation list lastMessage / unreadCount — never invents blank sidebar rows
 */
export function applyRealtimeMessage(
  qc: QueryClient,
  raw: RealtimeMessagePayload | Record<string, unknown>,
  currentUserId: string | undefined,
): ApplyRealtimeResult {
  const payload = parseRealtimeMessagePayload(raw);

  // Requests / alerts on `.message.sent` — leave to notification handler.
  if (isNotificationOnlyType(payload.type)) {
    return { handled: false, chatOpen: false, skippedOwn: false };
  }

  if (!isRealtimeMessageType(payload.type)) {
    return { handled: false, chatOpen: false, skippedOwn: false };
  }

  if (isRealtimeMessageUpdatedType(payload.type)) {
    const result = applyCompanyMessengerUpdate(qc, payload);
    return { handled: result.handled, chatOpen: result.chatOpen, skippedOwn: false, isUpdate: true };
  }

  // Non-chat types that somehow share REALTIME_MESSAGE_TYPES — toast only.
  if (!isChatBubbleType(payload.type)) {
    return { handled: false, chatOpen: false, skippedOwn: false };
  }

  if (payload.type === 'seo_direct_message') {
    const result = applyCompanyMessenger(qc, payload, currentUserId);
    const isMine = resolveIsMine(payload, currentUserId);
    return {
      handled: result.handled,
      chatOpen: result.chatOpen,
      // Own echo is applied via de-dupe; skip toast when it is a self-echo.
      skippedOwn: isMine,
    };
  }

  if (payload.type === 'hr_message') {
    const result = applyHrMessenger(qc, payload);
    return {
      handled: result.handled,
      chatOpen: result.chatOpen,
      skippedOwn: resolveIsMine(payload, currentUserId),
    };
  }

  refreshRealtimeMessages(qc, payload);
  return {
    handled: true,
    chatOpen: isRealtimeChatOpen(qc, payload),
    skippedOwn: resolveIsMine(payload, currentUserId),
  };
}
