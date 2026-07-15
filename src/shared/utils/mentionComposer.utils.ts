import type { MentionRef } from '@/shared/components/chat';
import { normalizeIsEdited } from '@/shared/utils/chatNormalize.utils';

export interface MentionablePerson {
  id:   string;
  name: string;
  type: string;
}

/** Collect mention refs whose @name still appears in the composed body. */
export function activeMentionsFromText(
  body: string,
  refs: MentionablePerson[],
): MentionRef[] {
  return refs
    .filter(m => body.includes(`@${m.name}`))
    .map(m => ({ type: m.type, id: m.id }));
}

export function messageWasEdited(msg: {
  isEdited?: boolean | null;
  is_edited?: boolean | null;
  editedAt?: string | null;
  edited_at?: string | null;
} | null | undefined): boolean {
  return normalizeIsEdited(msg);
}

export function toMentionRefs(raw: unknown[] | undefined): MentionRef[] | undefined {
  const refs = (raw ?? [])
    .filter((m): m is { type: unknown; id: unknown } => !!m && typeof m === 'object')
    .filter(m => typeof m.type === 'string' && (typeof m.id === 'string' || typeof m.id === 'number'))
    .map(m => ({ type: m.type as string, id: String(m.id) }));
  return refs.length ? refs : undefined;
}
