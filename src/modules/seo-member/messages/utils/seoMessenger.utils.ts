import type { AuthUser } from '@/modules/auth/types/auth.types';
import type { SeoConversation } from '../types/messages.types';

type ConversationWithObserver = SeoConversation & {
  is_observer?: boolean;
  can_send?:    boolean;
};

export function isSeoConversationObserver(conv: SeoConversation): boolean {
  const raw = conv as ConversationWithObserver;
  return Boolean(raw.isObserver ?? raw.is_observer);
}

function userConversationIds(user: Pick<AuthUser, 'id' | 'employeeId'>): Set<string> {
  return new Set([user.id, user.employeeId].filter(Boolean));
}

export function isUserInSeoGroup(conv: SeoConversation, user: Pick<AuthUser, 'id' | 'employeeId'>): boolean {
  const ids = userConversationIds(user);
  return (conv.participants ?? []).some(p => ids.has(p.id));
}

/**
 * Whether the open thread should show the message composer.
 * Super-admin may send in their own chats; observer / monitor threads stay read-only.
 */
export function canSendSeoMessengerMessage(
  conv: SeoConversation,
  user: Pick<AuthUser, 'id' | 'employeeId'> | null | undefined,
): boolean {
  if (!user) return false;

  // Observer / monitor mode is always read-only (including super-admin).
  if (isSeoConversationObserver(conv)) return false;

  const raw = conv as ConversationWithObserver;
  if (raw.canSend === true || raw.can_send === true) return true;

  // Group threads: send only when the user is an actual member.
  if (conv.type === 'group') return isUserInSeoGroup(conv, user);

  // Direct threads in the user's inbox are their own chats.
  return true;
}
