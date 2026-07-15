import { useState } from 'react';
import { MessageSquare, Plus, UsersRound, X } from 'lucide-react';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { matchesSearch } from '@/shared/utils/search.utils';
import { voiceMessageLabel } from '@/shared/utils/messagePreview.utils';
import type { SeoConversation, SeoConversationType } from '../types/messages.types';

const AVATAR_COLORS = [
  'bg-[#709028]', 'bg-blue-500', 'bg-purple-500',
  'bg-rose-500',  'bg-amber-500', 'bg-teal-500',
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtTime(raw: string | undefined | null, isAr: boolean) {
  if (!raw) return '';
  const d = new Date(raw.replace(' ', 'T'));
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 86_400_000) {
    return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
}

function conversationTitle(conv: SeoConversation, isAr: boolean) {
  if (conv.type === 'group') {
    return conv.name?.trim() || (isAr ? 'جروب' : 'Group');
  }
  return conv.participant?.name?.trim() || conv.name?.trim() || (isAr ? 'محادثة' : 'Chat');
}

function formatLastMessage(raw: string | null | undefined, isAr: boolean) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^voice message$/i.test(trimmed) || trimmed === 'رسالة صوتية') {
    return voiceMessageLabel(isAr);
  }
  return trimmed;
}

type TypeFilter = 'all' | SeoConversationType;

interface Props {
  conversations: SeoConversation[];
  activeId:      string | null;
  loading:       boolean;
  error?:        boolean;
  errorMessage?: string;
  onRetry?:      () => void;
  isAr:          boolean;
  typeFilter:    TypeFilter;
  onTypeFilter:  (type: TypeFilter) => void;
  onSelect:      (conv: SeoConversation) => void;
  onNewChat:     () => void;
  onCreateGroup: () => void;
  canCreateGroup?: boolean;
  onClose?:      () => void;
}

const FILTERS: { value: TypeFilter; labelAr: string; labelEn: string }[] = [
  { value: 'all',    labelAr: 'الكل',     labelEn: 'All' },
  { value: 'direct', labelAr: 'مباشر',    labelEn: 'Direct' },
  { value: 'group',  labelAr: 'جروبات',   labelEn: 'Groups' },
];

export function SeoConversationList({
  conversations,
  activeId,
  loading,
  error,
  errorMessage,
  onRetry,
  isAr,
  typeFilter,
  onTypeFilter,
  onSelect,
  onNewChat,
  onCreateGroup,
  canCreateGroup = false,
  onClose,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    return matchesSearch([conversationTitle(c, isAr), c.lastMessage ?? ''], search);
  });

  const showErrorEmpty = !!error && conversations.length === 0 && !loading;

  return (
    <div className="flex flex-col h-full border-s border-gray-100 dark:border-gray-700/60">
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700/60 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
              {isAr ? 'الرسائل' : 'Messages'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-[#A0CD39] hover:bg-[#709028] text-white
                       text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            {isAr ? 'محادثة جديدة' : 'New Chat'}
          </button>
        </div>

        {/* Search + WhatsApp-style new group icon (managers / super-admin only) */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={isAr ? 'بحث في المحادثات...' : 'Search...'}
            isAr={isAr}
            className="flex-1 min-w-0"
          />
          {canCreateGroup && (
            <button
              type="button"
              onClick={onCreateGroup}
              title={isAr ? 'جروب جديد' : 'New group'}
              aria-label={isAr ? 'جروب جديد' : 'New group'}
              className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl
                         border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-800
                         text-[#709028] hover:bg-[#D8EBAE]/70 hover:border-[#A0CD39]
                         transition-colors"
            >
              <UsersRound size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {FILTERS.map(f => {
            const active = typeFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => onTypeFilter(f.value)}
                className={[
                  'flex-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-2/3" />
                <div className="h-2.5 rounded bg-gray-100 dark:bg-gray-800 w-full" />
              </div>
            </div>
          ))
        ) : showErrorEmpty ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-red-400">
            <MessageSquare size={28} className="opacity-40" />
            <p className="text-xs text-center px-4">
              {isAr ? 'تعذر تحميل المحادثات' : 'Failed to load conversations'}
            </p>
            {errorMessage && (
              <p className="text-[11px] text-center px-4 text-red-300/80 max-w-56 break-words">
                {errorMessage}
              </p>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 text-xs font-medium text-[#709028] hover:underline"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-gray-400">
            <MessageSquare size={28} className="opacity-30" />
            <p className="text-xs">{isAr ? 'لا توجد محادثات' : 'No conversations'}</p>
          </div>
        ) : (
          filtered.map(conv => {
            const title = conversationTitle(conv, isAr);
            const initial = title.charAt(0).toUpperCase();
            const color = avatarColor(conv.id);
            const preview = formatLastMessage(conv.lastMessage, isAr);
            const time = fmtTime(conv.lastMessageAt, isAr);
            const unread = conv.unreadCount ?? 0;
            const isActive = activeId === conv.id;
            const isGroup = conv.type === 'group';

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 text-start transition-colors',
                  'border-b border-gray-50 dark:border-gray-700/30',
                  isActive
                    ? 'bg-[#D8EBAE]/40 dark:bg-[#D8EBAE]/10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                ].join(' ')}
              >
                <div className={`relative w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold text-white">{initial}</span>
                  {isGroup && (
                    <span className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full
                                     bg-white dark:bg-gray-900 flex items-center justify-center
                                     border border-gray-100 dark:border-gray-700">
                      <UsersRound size={9} className="text-[#709028]" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate
                                   ${isActive ? 'text-[#709028] dark:text-[#A0CD39]' : 'text-gray-800 dark:text-gray-100'}`}>
                      {title}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0">{time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
                      {isGroup
                        ? (
                          <>
                            <span className="text-[10px] text-[#709028] dark:text-[#A0CD39] me-1">
                              {conv.participantCount ?? conv.participants?.length ?? 0}{' '}
                              {isAr ? 'أعضاء' : 'members'}
                            </span>
                            {preview ? `· ${preview}` : ''}
                          </>
                        )
                        : (preview || (isAr ? 'ابدأ محادثة...' : 'Start chatting...'))}
                    </p>
                    {unread > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-[#A0CD39] text-gray-900
                                       text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
