import type { QueryClient } from '@tanstack/react-query';
import type { SeoConversation, SeoMessage, SeoParticipant } from '@/modules/seo-member/messages/types/messages.types';
import type { RealtimeMessagePayload } from './messageRealtime.types';
import { isRealtimeMessageType } from './messageRealtime.types';
import { isConversationOpen } from './activeConversation.store';
import {
  isRealtimeChatOpen,
  parseRealtimeMessagePayload,
  refreshRealtimeMessages,
} from './refreshRealtimeMessages';

export const COMPANY_CONV_KEY = ['seo-member', 'messages', 'conversations'] as const;
export const companyMsgKey = (id: string) => ['seo-member', 'messages', 'messages', id] as const;

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

/** Notification body is often "Name: preview" — prefer preview for chat bubble. */
function messageBodyFromPayload(payload: RealtimeMessagePayload): string {
  const raw = String(payload.body ?? '').trim();
  if (!raw) return '';
  const name = senderName(payload);
  if (name && raw.startsWith(`${name}:`)) {
    return raw.slice(name.length + 1).trim();
  }
  return raw;
}

function isOwnSender(payload: RealtimeMessagePayload, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false;
  const id = senderId(payload);
  return !!id && id === currentUserId;
}

function appendMessage<T extends { id: string | number }>(
  prev: T[] | undefined,
  msg: T,
): T[] {
  const list = prev ?? [];
  if (list.some(m => String(m.id) === String(msg.id))) return list;
  return [...list, msg];
}

function conversationFromPayload(
  payload: RealtimeMessagePayload,
  opts: { isOpen: boolean; body: string },
): SeoConversation | null {
  const conversationId = payload.conversationId;
  if (!conversationId) return null;

  const sid = senderId(payload);
  const participant: SeoParticipant | null = sid
    ? {
        id:   sid,
        name: senderName(payload) || '…',
        type: (senderType(payload) === 'employee' ? 'employee' : 'admin'),
      }
    : null;

  return {
    id:             conversationId,
    type:           payload.conversationType === 'group' ? 'group' : 'direct',
    name:           payload.conversationName ?? null,
    lastMessage:    opts.body || null,
    lastMessageAt:  new Date().toISOString(),
    unreadCount:    opts.isOpen ? 0 : 1,
    participant,
    participants:   payload.conversationType === 'group' && participant ? [participant] : null,
  };
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
    const seeded = conversationFromPayload(payload, opts);
    return seeded ? [seeded, ...list] : list;
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

function applyCompanyMessenger(
  qc: QueryClient,
  payload: RealtimeMessagePayload,
): { handled: boolean; chatOpen: boolean; needsListRefetch: boolean } {
  const conversationId = payload.conversationId;
  if (!conversationId) {
    qc.invalidateQueries({ queryKey: COMPANY_CONV_KEY });
    return { handled: true, chatOpen: false, needsListRefetch: true };
  }

  const body = messageBodyFromPayload(payload);
  const chatOpen = isConversationOpen(conversationId, 'company')
    || qc.getQueryCache().findAll({ queryKey: companyMsgKey(conversationId), type: 'active' }).length > 0;

  const msg: SeoMessage = {
    id:      payload.messageId ?? `rt-${Date.now()}`,
    body:    body || null,
    sender:  {
      id:   senderId(payload) ?? '',
      name: senderName(payload) || '…',
      type: senderType(payload),
    },
    isMine:  false,
    sentAt:  new Date().toISOString(),
  };

  // Always keep thread cache warm so opening the chat shows the new message.
  qc.setQueryData<SeoMessage[]>(companyMsgKey(conversationId), (prev) => appendMessage(prev, msg));

  const matching = qc.getQueriesData<SeoConversation[]>({ queryKey: COMPANY_CONV_KEY });
  if (matching.length === 0) {
    // Query never succeeded (e.g. list API error) — seed the default "all" list.
    qc.setQueryData<SeoConversation[]>(
      [...COMPANY_CONV_KEY, 'all', ''],
      upsertCompanyConversation(undefined, payload, { isOpen: chatOpen, body }),
    );
  } else {
    qc.setQueriesData<SeoConversation[]>(
      { queryKey: COMPANY_CONV_KEY },
      (prev) => upsertCompanyConversation(prev, payload, { isOpen: chatOpen, body }),
    );
  }

  // Soft-refetch in background; don't wipe seeded data on failure.
  qc.invalidateQueries({ queryKey: COMPANY_CONV_KEY, refetchType: 'none' });
  void qc.refetchQueries({ queryKey: COMPANY_CONV_KEY, type: 'active' });

  return { handled: true, chatOpen, needsListRefetch: false };
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
}

/**
 * Apply a realtime message event to React Query caches.
 * - Skips when sender is the current user (UI already showed POST response)
 * - Appends into open company thread
 * - Upserts conversation list lastMessage / unreadCount / order (even if list API failed)
 */
export function applyRealtimeMessage(
  qc: QueryClient,
  raw: RealtimeMessagePayload | Record<string, unknown>,
  currentUserId: string | undefined,
): ApplyRealtimeResult {
  const payload = parseRealtimeMessagePayload(raw);

  if (!isRealtimeMessageType(payload.type)) {
    return { handled: false, chatOpen: false, skippedOwn: false };
  }

  if (isOwnSender(payload, currentUserId)) {
    return { handled: true, chatOpen: false, skippedOwn: true };
  }

  if (payload.type === 'seo_direct_message') {
    const result = applyCompanyMessenger(qc, payload);
    return { handled: result.handled, chatOpen: result.chatOpen, skippedOwn: false };
  }

  if (payload.type === 'hr_message') {
    const result = applyHrMessenger(qc, payload);
    return { handled: result.handled, chatOpen: result.chatOpen, skippedOwn: false };
  }

  refreshRealtimeMessages(qc, payload);
  return {
    handled: true,
    chatOpen: isRealtimeChatOpen(qc, payload),
    skippedOwn: false,
  };
}
