import { AtSign, Paperclip, Search, Send } from 'lucide-react';
import { Avatar }               from '@/shared/components/ui/Avatar';
import { useProjectMessages }   from '../hooks/useProjectMessages';

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectMessagesTab({ projectId, isAr }: Props) {
  const {
    filtered, text, setText, search, setSearch, send, handleKey, bottomRef, isLoading,
    showMentions, setShowMentions, mentionables, insertMention,
  } = useProjectMessages(projectId);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث في الرسائل...' : 'Search messages...'}
            className="w-full pe-9 ps-4 py-2 text-sm rounded-xl
                       bg-gray-50 dark:bg-gray-700/50
                       border border-gray-100 dark:border-gray-600
                       text-gray-700 dark:text-gray-300
                       placeholder:text-gray-400
                       text-end
                       focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
          />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5
                      min-h-[380px] max-h-[460px]
                      bg-gray-50/70 dark:bg-gray-900/20">
        {isLoading ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
            {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
          </p>
        ) : filtered.map(msg =>
          msg.isOwn ? (
            /* Own message — right side */
            <div key={msg.id} className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400 dark:text-gray-500 pe-1">
                {msg.senderName}&emsp;{msg.time}
              </span>
              <div className="max-w-[65%] px-4 py-2.5 rounded-2xl rounded-tr-sm
                              bg-[#A0CD39] text-white text-sm leading-relaxed shadow-sm">
                {msg.text}
              </div>
              {msg.isRead && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 pe-1">
                  {isAr ? 'قرأت ✓✓' : 'Read ✓✓'}
                </span>
              )}
            </div>
          ) : (
            /* Other member message — left side */
            <div key={msg.id} className="flex items-start gap-2.5">
              <Avatar initial={msg.senderInitial} color={msg.senderColor} size="sm" />
              <div className="space-y-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 ps-1">
                  {msg.senderName}&emsp;{msg.time}
                </span>
                <div className="max-w-[65%] px-4 py-2.5 rounded-2xl rounded-tl-sm
                                bg-white dark:bg-gray-700
                                border border-gray-100 dark:border-gray-600
                                text-sm text-gray-800 dark:text-gray-200
                                leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2.5">

          {/* Send button — visually on the right in RTL (first in DOM) */}
          <button
            type="button"
            onClick={send}
            className="w-9 h-9 rounded-full bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center shrink-0
                       transition-colors shadow-sm"
          >
            <Send size={15} className="text-white" />
          </button>

          {/* Text */}
          <textarea
            rows={1}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isAr ? 'اكتب رسالة...' : 'Write a message...'}
            className="flex-1 resize-none text-sm rounded-xl
                       bg-gray-50 dark:bg-gray-700/50
                       border border-gray-100 dark:border-gray-600
                       px-3.5 py-2
                       text-gray-700 dark:text-gray-300
                       placeholder:text-gray-400
                       text-end
                       focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
          />

          {/* Icon buttons — visually on the left in RTL (last in DOM) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMentions(o => !o)}
              className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
            >
              <AtSign size={17} />
            </button>
            {showMentions && (
              <div className="absolute bottom-full mb-2 end-0 w-56 max-h-56 overflow-y-auto
                              rounded-xl border border-gray-200 dark:border-gray-600
                              bg-white dark:bg-gray-800 shadow-xl z-10 py-1">
                {mentionables.length === 0 ? (
                  <p className="px-3 py-2.5 text-xs text-gray-400 text-center">
                    {isAr ? 'لا يوجد أعضاء' : 'No members'}
                  </p>
                ) : mentionables.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => insertMention(m)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-end
                               text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Avatar initial={m.avatarInitial} color="bg-gray-400" size="sm" />
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button"
            className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors">
            <Paperclip size={17} />
          </button>
        </div>
      </div>

    </div>
  );
}
