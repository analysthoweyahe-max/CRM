import { Search, Send, AtSign, Paperclip } from 'lucide-react';
import { useProjectMessages }              from './useProjectMessages';

/* ── Helpers ─────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-violet-500', 'bg-sky-500', 'bg-amber-500',
  'bg-rose-500',   'bg-teal-500', 'bg-indigo-500',
  'bg-[#A0CD39]',  'bg-orange-500',
];

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('ar-EG', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return '';
  }
}

/* ── Props ───────────────────────────────────────────────────────────── */
interface Props {
  projectId: string;
  isAr:      boolean;
}

/* ── Component ───────────────────────────────────────────────────────── */
export function ProjectMessages({ projectId, isAr }: Props) {
  const {
    messages, isLoading, currentUserId,
    search, setSearch,
    text, handleTextChange, handleKeyDown, handleSend, isSending,
    apiError,
    showMentions, filteredMentions, insertMention, openMention,
    openFilePicker, handleFileChange, fileRef,
    bottomRef,
  } = useProjectMessages(projectId);

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border
                 border-gray-100 dark:border-gray-700/60 overflow-hidden"
      style={{ height: 'calc(100vh - 22rem)', minHeight: '420px' }}
    >
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Search bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? 'ابحث في الرسائل...' : 'Search messages…'}
          className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200
                     placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {/* ── Messages list ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-end gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="h-10 w-48 rounded-2xl bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine  = msg.sender.id === currentUserId;
            const initial = msg.sender.name?.[0]?.toUpperCase() ?? '?';

            return isMine ? (
              /* ── Current user: right side (justify-start = visual right in RTL) ── */
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[70%]">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 ms-1">
                    {msg.sender.name}
                    <span className="ms-2">{formatTime(msg.createdAt)}</span>
                  </p>
                  <div className="bg-[#A0CD39] text-white px-4 py-2.5 rounded-2xl
                                  rounded-tl-sm text-sm leading-relaxed wrap-break-word">
                    {msg.content}
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 ms-1">
                    {isAr ? 'قرأت' : 'Read'} ✓✓
                  </p>
                </div>
              </div>
            ) : (
              /* ── Other user: left side (justify-end = visual left in RTL) ── */
              <div key={msg.id} className="flex items-end gap-2 justify-end">
                <div className="max-w-[70%]">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 text-end me-1">
                    {msg.sender.name}
                    <span className="ms-2">{formatTime(msg.createdAt)}</span>
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100
                                  px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed wrap-break-word">
                    {msg.content}
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-full ${avatarColor(msg.sender.name)}
                                  flex items-center justify-center text-white text-xs
                                  font-semibold shrink-0 self-end`}>
                  {initial}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── @ Mention dropdown (above input) ────────────────────────── */}
      {showMentions && filteredMentions.length > 0 && (
        <div className="mx-4 mb-1 bg-white dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-xl shadow-lg overflow-hidden
                        max-h-44 overflow-y-auto z-10">
          {filteredMentions.map(m => (
            <button
              key={m.id}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                insertMention(m.name);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                         text-gray-700 dark:text-gray-200
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className={`w-7 h-7 rounded-full ${avatarColor(m.name)} shrink-0
                               text-white text-[11px] flex items-center justify-center font-medium`}>
                {m.name[0]?.toUpperCase()}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* ── API error ────────────────────────────────────────────────── */}
      {apiError && (
        <p className="text-xs text-red-500 dark:text-red-400 px-4 pb-1 text-start">
          {apiError}
        </p>
      )}

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-3">
        <div className="flex items-end gap-2">

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className="shrink-0 w-10 h-10 rounded-full bg-[#A0CD39]
                       hover:bg-[#709028] disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors"
          >
            <Send size={15} className="text-white" />
          </button>

          {/* Text area */}
          <textarea
            rows={1}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message…'}
            className="flex-1 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800
                       dark:text-gray-100 placeholder:text-gray-400 rounded-xl
                       px-4 py-2.5 resize-none focus:outline-none focus:ring-2
                       focus:ring-[#A0CD39] border border-gray-200 dark:border-gray-700
                       leading-relaxed"
            style={{ minHeight: '40px', maxHeight: '112px', overflowY: 'auto' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
            }}
          />

          {/* @ mention */}
          <button
            type="button"
            onClick={openMention}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-[#709028] hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors"
            title={isAr ? 'ذكر شخص' : 'Mention someone'}
          >
            <AtSign size={18} />
          </button>

          {/* Attachment / image */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isSending}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full
                       text-gray-400 hover:text-[#709028] hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
            title={isAr ? 'إرفاق ملف' : 'Attach file'}
          >
            <Paperclip size={18} />
          </button>

        </div>
      </div>
    </div>
  );
}
