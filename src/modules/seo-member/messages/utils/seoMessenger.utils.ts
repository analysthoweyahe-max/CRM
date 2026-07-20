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

/** Whether the open thread should show the message composer. */
export function canSendSeoMessengerMessage(
  conv: SeoConversation,
  user: Pick<AuthUser, 'id' | 'employeeId'> | null | undefined,
  isSuperAdmin: boolean,
): boolean {
  if (!user) return false;

  const raw = conv as ConversationWithObserver;
  if (typeof raw.canSend === 'boolean') return raw.canSend;
  if (typeof raw.can_send === 'boolean') return raw.can_send;

  if (isSuperAdmin) return false;
  if (isSeoConversationObserver(conv)) return false;
  if (conv.type === 'group' && !isUserInSeoGroup(conv, user)) return false;

  return true;
}
