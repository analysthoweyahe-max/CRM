import { useState } from 'react';
import { Plus, MessageSquare, X } from 'lucide-react';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { matchesSearch } from '@/shared/utils/search.utils';
import type { ApiConversation } from '../types/messages.types';

interface Props {
  conversations: ApiConversation[];
  activeConvId:  string | null;
  currentUserId: string;
  loading:       boolean;
  isAr:          boolean;
  onSelect:      (conv: ApiConversation) => void;
  onNew:         () => void;
  onClose?:      () => void;
}

const AVATAR_COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-500', 'bg-purple-400',
  'bg-yellow-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function fmtTime(raw: string | undefined, isAr: boolean): string {
  if (!raw) return '';
  const d       = new Date(raw);
  const now     = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffDay === 0)
    return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function ConversationList({
  conversations, activeConvId, currentUserId, loading, isAr, onSelect, onNew, onClose,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(conv => {
    if (!search) return true;
    const other = conv.participants.find(p => p.id !== currentUserId) ?? conv.participants[0];
    return matchesSearch([other?.name], search);
  });

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center justify-between mb-3">
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
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-[#A0CD39] hover:bg-[#709028] text-white
                       text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            {isAr ? 'محادثة جديدة' : 'New Chat'}
          </button>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={isAr ? 'بحث في المحادثات...' : 'Search conversations...'}
          isAr={isAr}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-1/2" />
                <div className="h-2.5 rounded bg-gray-100 dark:bg-gray-800 w-3/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-gray-400">
            <MessageSquare size={32} className="opacity-30" />
            <p className="text-sm">
              {isAr ? 'لا توجد محادثات' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map(conv => {
            const other    = conv.participants.find(p => p.id !== currentUserId) ?? conv.participants[0];
            const name     = other?.name ?? (isAr ? 'محادثة' : 'Chat');
            const initial  = name.charAt(0).toUpperCase();
            const color    = avatarColor(name);
            const preview  = conv.last_message?.body ?? '';
            const time     = fmtTime(conv.last_message?.created_at ?? conv.created_at, isAr);
            const unread   = conv.unread_count ?? 0;
            const isActive = activeConvId === conv.id;

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-start
                            border-b border-gray-50 dark:border-gray-700/30 transition-colors
                            ${isActive
                              ? 'bg-[#D8EBAE]/40 dark:bg-[#D8EBAE]/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold text-white">{initial}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate
                                   ${isActive ? 'text-[#709028] dark:text-[#A0CD39]' : 'text-gray-800 dark:text-gray-100'}`}>
                      {name}
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate
                                   ${unread > 0
                                     ? 'text-gray-700 dark:text-gray-200 font-medium'
                                     : 'text-gray-400 dark:text-gray-500'}`}>
                      {preview || (isAr ? 'ابدأ محادثة...' : 'Start a conversation...')}
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
