import type { MentionRef } from '@/shared/components/chat';
import { toMentionRefs } from '@/shared/utils/mentionComposer.utils';

/** Read edited flag from camelCase or snake_case API payloads. */
export function normalizeIsEdited(raw: {
  isEdited?: boolean | null;
  is_edited?: boolean | null;
  editedAt?: string | null;
  edited_at?: string | null;
} | null | undefined): boolean {
  if (!raw) return false;
  if (raw.isEdited === true || raw.is_edited === true) return true;
  return !!(raw.editedAt || raw.edited_at);
}

export function normalizeEditedAt(raw: {
  editedAt?: string | null;
  edited_at?: string | null;
} | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.editedAt ?? raw.edited_at;
  return typeof v === 'string' && v.trim() ? v : null;
}

/**
 * Compare comment/message sender.id to the current user.
 * Backend sender.id uses employee/admin uuid — match against both id and employeeId
 * because AuthUser.employeeId may be employeeNumber for some logins.
 */
export function isSameActorId(
  senderId: string | number | null | undefined,
  user: { id?: string | null; employeeId?: string | null } | null | undefined,
): boolean {
  if (senderId == null || !user) return false;
  const sid = String(senderId);
  if (user.id && sid === String(user.id)) return true;
  if (user.employeeId && sid === String(user.employeeId)) return true;
  return false;
}

export function normalizeMentions(raw: unknown): MentionRef[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return toMentionRefs(raw);
}

/** Normalize a messenger message at the API boundary (camelCase internals). */
export function normalizeSeoMessage<T extends { id: string | number; body: string | null; sender: unknown }>(
  raw: T,
): T & {
  isEdited: boolean;
  editedAt: string | null;
} {
  return {
    ...raw,
    isEdited: normalizeIsEdited(raw as Parameters<typeof normalizeIsEdited>[0]),
    editedAt: normalizeEditedAt(raw as Parameters<typeof normalizeEditedAt>[0]),
    ...(Array.isArray((raw as { mentions?: unknown }).mentions)
      ? { mentions: normalizeMentions((raw as { mentions?: unknown }).mentions) }
      : {}),
  };
}

export function normalizeTaskCommentFields(raw: {
  isEdited?: boolean | null;
  is_edited?: boolean | null;
  editedAt?: string | null;
  edited_at?: string | null;
  mentions?: unknown;
}): { isEdited: boolean; editedAt: string | null; mentions?: MentionRef[] } {
  const mentions = normalizeMentions(raw.mentions);
  return {
    isEdited: normalizeIsEdited(raw),
    editedAt: normalizeEditedAt(raw),
    ...(mentions ? { mentions } : {}),
  };
}
