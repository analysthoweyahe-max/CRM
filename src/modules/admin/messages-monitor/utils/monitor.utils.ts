import type {
  ApiMonitoredMessage,
  MonitoredConversation,
  MonitoredParty,
} from '../types/monitor.types';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readTime(...values: unknown[]): string {
  for (const value of values) {
    const s = readString(value);
    if (s) return s;
  }
  return '';
}

function readParty(raw: unknown): MonitoredParty | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const name = readString(row.name);
  if (!name) return null;
  return {
    id:   row.id != null ? String(row.id) : null,
    name,
    type: readString(row.type),
  };
}

/** Do NOT filter by isObserver — observers must remain visible. */
export function normalizeMessengerConversations(payload: unknown): MonitoredConversation[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object' && row.id != null)
    .map((raw) => {
      const parties: MonitoredParty[] = [];
      const seen = new Set<string>();
      if (Array.isArray(raw.participants)) {
        for (const p of raw.participants) {
          const party = readParty(p);
          if (!party) continue;
          const key = `${party.id ?? ''}:${party.name}`;
          if (seen.has(key)) continue;
          seen.add(key);
          parties.push(party);
        }
      }

      const type = readString(raw.type) ?? 'direct';
      const nameFromApi = readString(raw.name);
      const name = type === 'group'
        ? (nameFromApi ?? 'Group')
        : (nameFromApi
          ?? (parties.length >= 2 ? parties.map((p) => p.name).join(' ↔ ') : parties[0]?.name)
          ?? 'Conversation');

      return {
        id:            String(raw.id),
        type,
        name,
        parties,
        lastMessage:   readString(raw.lastMessage) ?? readString(raw.last_message),
        lastMessageAt: readTime(raw.lastMessageAt, raw.last_message_at),
        // Keep true AND false — never drop observer chats
        isObserver:    Boolean(raw.isObserver ?? raw.is_observer),
        unreadCount:   Number(raw.unreadCount ?? raw.unread_count ?? 0) || 0,
        source:        'messenger' as const,
      };
    });
}

export function partiesLabel(parties: MonitoredParty[], isAr: boolean): string {
  if (parties.length === 0) return isAr ? 'طرفان غير معروفين' : 'Unknown parties';
  if (parties.length === 1) return parties[0].name;
  if (parties.length === 2) return `${parties[0].name} ↔ ${parties[1].name}`;
  return parties.map((p) => p.name).join(', ');
}

export function partyTypeLabel(type: string | null | undefined, isAr: boolean): string {
  if (type === 'admin') return isAr ? 'أدمن' : 'Admin';
  if (type === 'employee') return isAr ? 'موظف' : 'Employee';
  return type || '';
}

export function normalizeMonitoredMessages(payload: unknown): ApiMonitoredMessage[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map((raw) => {
      const sender = raw.sender && typeof raw.sender === 'object'
        ? raw.sender as Record<string, unknown>
        : null;
      const senderName = readString(sender?.name)
        ?? readString(raw.senderName)
        ?? readString(raw.sender_name);

      return {
        id:   raw.id as string | number,
        body: readString(raw.body) ?? undefined,
        createdAt: readTime(raw.createdAt, raw.sentAt, raw.created_at, raw.sent_at, raw.sentTime),
        sender: (sender || senderName) ? {
          id:            sender?.id != null ? String(sender.id) : undefined,
          name:          senderName ?? undefined,
          type:          readString(sender?.type) ?? undefined,
          avatarInitial: readString(sender?.avatarInitial)
            ?? (senderName ? senderName.charAt(0).toUpperCase() : undefined),
        } : null,
        source: 'messenger',
      };
    });
}

export function sortMessagesChronological(messages: ApiMonitoredMessage[]): ApiMonitoredMessage[] {
  return [...messages].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt.replace(' ', 'T')).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt.replace(' ', 'T')).getTime() : 0;
    return ta - tb;
  });
}

/** Patch conversation list from Echo `.message.sent` (seo_direct_message). */
export function applyRealtimeToConversations(
  list: MonitoredConversation[],
  event: {
    conversationId?: string;
    body?: string;
    sender?: { name?: string } | string;
    isObserver?: boolean;
  },
): MonitoredConversation[] {
  const conversationId = event.conversationId ? String(event.conversationId) : '';
  if (!conversationId) return list;

  const body = typeof event.body === 'string' ? event.body : '';
  const now = new Date().toISOString();
  const idx = list.findIndex((c) => c.id === conversationId);

  if (idx === -1) {
    // Unknown conversation — caller should refetch; keep list as-is
    return list;
  }

  const next = [...list];
  const current = next[idx];
  next[idx] = {
    ...current,
    lastMessage:   body || current.lastMessage,
    lastMessageAt: now,
    unreadCount:   (current.unreadCount || 0) + 1,
    // Preserve observer flag from event when provided
    isObserver:    event.isObserver != null ? Boolean(event.isObserver) : current.isObserver,
  };

  next.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt.replace(' ', 'T')).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt.replace(' ', 'T')).getTime() : 0;
    return tb - ta;
  });

  return next;
}
