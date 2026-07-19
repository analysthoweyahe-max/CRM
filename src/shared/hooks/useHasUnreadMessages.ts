import { useSeoConversations } from '@/modules/seo-member/messages/hooks/useSeoMessages';

/** True when any company-messenger conversation has unread messages (no total count). */
export function useHasUnreadMessages(): boolean {
  const { data } = useSeoConversations();
  return (data ?? []).some((c) => {
    const raw = c as { unreadCount?: number; unread_count?: number };
    return (raw.unreadCount ?? raw.unread_count ?? 0) > 0;
  });
}
