import { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import type { EmpConversation } from '../types/messages.types';

const AVATAR_COLORS = [
  'bg-[#709028]', 'bg-blue-500', 'bg-purple-500',
  'bg-rose-500',  'bg-amber-500', 'bg-teal-500',
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtTime(raw: string | undefined, isAr: boolean) {
  if (!raw) return '';
  const d      = new Date(raw);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 86_400_000)
    return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
}

interface Props {
  conversations: EmpConversation[];
  activeId:      string | null;
  loading:       boolean;
  isAr:          boolean;
  onSelect:      (conv: EmpConversation) => void;
}

export function EmpConversationList({ conversations, activeId, loading, isAr, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const name = c.name ?? c.participants?.[0]?.name ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full border-s border-gray-100 dark:border-gray-700/60">

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700/60">
        <div className="relative">
          <Search size={13} className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث في المحادثات...' : 'Search...'}
            className="w-full ps-8 pe-3 py-2 text-xs rounded-xl
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-100 dark:border-gray-700
                       text-gray-700 dark:text-gray-200
                       placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40"
          />
        </div>
      </div>

      {/* List */}
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-gray-400">
            <MessageSquare size={28} className="opacity-30" />
            <p className="text-xs">{isAr ? 'لا توجد محادثات' : 'No conversations'}</p>
          </div>
        ) : (
          filtered.map(conv => {
            const name     = conv.name ?? conv.participants?.[0]?.name ?? (isAr ? 'محادثة' : 'Chat');
            const initial  = name.charAt(0).toUpperCase();
            const color    = avatarColor(conv.id);
            const preview  = conv.last_message?.body ?? '';
            const time     = fmtTime(conv.last_message?.created_at ?? conv.created_at, isAr);
            const unread   = conv.unread_count ?? 0;
            const isActive = activeId === conv.id;

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
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold text-white">{initial}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate
                                   ${isActive ? 'text-[#709028] dark:text-[#A0CD39]' : 'text-gray-800 dark:text-gray-100'}`}>
                      {name}
                    </p>
                    <span className="text-[11px] text-gray-400 shrink-0">{time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
                      {preview || (isAr ? 'ابدأ محادثة...' : 'Start chatting...')}
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
