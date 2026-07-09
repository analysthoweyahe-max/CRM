import type { ApiConversation, ApiMessage, ApiMessageAttachment } from '../types/messages.types';

function normalizeAttachment(att: ApiMessageAttachment): ApiMessageAttachment {
  const extra = att as ApiMessageAttachment & Record<string, unknown>;
  return {
    ...att,
    type: att.type ?? (extra.mimeType as string | undefined) ?? '',
    name: att.name ?? (extra.fileName as string | undefined),
    url:  att.url ?? (extra.url as string | undefined) ?? '',
  };
}

/** Normalize API message fields (camelCase / snake_case / alternate body keys). */
export function normalizeApiMessage(raw: ApiMessage): ApiMessage {
  const r = raw as ApiMessage & Record<string, unknown>;
  const attachments = (raw.attachments ?? []).map(normalizeAttachment);

  return {
    ...raw,
    body:       raw.body ?? (r.text as string | undefined) ?? (r.message as string | undefined) ?? '',
    created_at: raw.created_at ?? raw.sentAt ?? (r.createdAt as string | undefined),
    sentAt:     raw.sentAt ?? raw.created_at ?? (r.createdAt as string | undefined),
    read_at:    raw.read_at ?? (r.readAt as string | null | undefined) ?? null,
    isMine:     raw.isMine ?? (r.is_mine as boolean | undefined),
    attachments,
  };
}

/** Ensure list/detail payloads always expose a stable conversation uuid as `id`. */
export function normalizeApiConversation(raw: ApiConversation): ApiConversation {
  const r = raw as ApiConversation & Record<string, unknown>;
  const id = String(raw.id ?? r.uuid ?? '');
  return { ...raw, id };
}

/** Stable conversation id for message API routes. */
export function conversationMessageId(conv: { id?: string | number; uuid?: string }): string {
  return String(conv.id ?? conv.uuid ?? '');
}
