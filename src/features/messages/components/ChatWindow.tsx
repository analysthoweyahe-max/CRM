import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, Check, CheckCheck, FileText, Menu } from 'lucide-react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import type { StreamChannel } from '../types/messages.types';

interface Props {
  channel:          StreamChannel;
  currentUserId:    string;
  isAr:             boolean;
  onOpenSidebar?:   () => void;
}

const AVATAR_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-500','bg-purple-400',
  'bg-yellow-400','bg-pink-400','bg-indigo-400','bg-teal-400',
];
const REACTIONS = ['👍','❤️','😂','😮','😢','👏'];

// Stream reaction type must be alphanumeric — emoji chars are rejected by the API
const EMOJI_TO_TYPE: Record<string, string> = {
  '👍': 'like', '❤️': 'love', '😂': 'haha', '😮': 'wow', '😢': 'sad', '👏': 'clap',
};
const TYPE_TO_EMOJI: Record<string, string> = Object.fromEntries(
  Object.entries(EMOJI_TO_TYPE).map(([emoji, type]) => [type, emoji]),
);

function avatarColor(s: string) { return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]; }

function fmtTime(raw: Date | string, isAr: boolean) {
  const d = raw instanceof Date ? raw : new Date(raw as string);
  return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ReactionPopup = { id: string; top: number; left: number } | null;

export function ChatWindow({ channel, currentUserId, isAr, onOpenSidebar }: Props) {
  type Msg     = (typeof channel.state.messages)[number];
  type ReadMap = typeof channel.state.read;

  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [reads,      setReads]      = useState<ReadMap>(channel.state.read);
  const [text,       setText]       = useState('');
  const [sending,    setSending]    = useState(false);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [reacting,   setReacting]   = useState<ReactionPopup>(null);

  const { isDark } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── subscribe to channel events
  useEffect(() => {
    setMessages([...channel.state.messages]);
    setReads({ ...channel.state.read });
    channel.markRead().catch(() => {});

    const subs = [
      channel.on('message.new', ev => {
        if (!ev.message) return;
        setMessages(prev => {
          if (prev.some(m => m.id === ev.message!.id)) return prev;
          return [...prev, ev.message as unknown as Msg];
        });
      }),
      channel.on('reaction.new',     () => setMessages([...channel.state.messages])),
      channel.on('reaction.deleted', () => setMessages([...channel.state.messages])),
      channel.on('message.read',     () => setReads({ ...channel.state.read })),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [channel]);

  // ── auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── close popups on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-emoji]'))    setShowEmoji(false);
      if (!t.closest('[data-reaction]')) setReacting(null);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ── send text
  const send = useCallback(async () => {
    const t = text.trim();
    if (!t || sending) return;
    setText('');
    setSending(true);
    try   { await channel.sendMessage({ text: t }); }
    catch { setText(t); }
    finally { setSending(false); inputRef.current?.focus(); }
  }, [text, sending, channel]);

  // ── upload file / image
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      if (file.type.startsWith('image/')) {
        const { file: url } = await channel.sendImage(file as unknown as string);
        await channel.sendMessage({ attachments: [{ type: 'image', image_url: url, title: file.name }] });
      } else {
        const { file: url } = await channel.sendFile(file as unknown as string);
        await channel.sendMessage({ attachments: [{ type: 'file', asset_url: url, title: file.name, mime_type: file.type, file_size: file.size }] });
      }
    } catch (err) { console.error('[Stream] upload', err); }
  }

  // ── send / toggle reaction
  async function react(msgId: string, emoji: string) {
    const newType  = EMOJI_TO_TYPE[emoji] ?? emoji;
    const msg      = messages.find(m => m.id === msgId);
    const existing = msg?.own_reactions?.[0];          // user can have at most one reaction
    try {
      if (existing) await channel.deleteReaction(msgId, existing.type);
      if (!existing || existing.type !== newType) {
        await channel.sendReaction(msgId, { type: newType });
      }
    } catch (err) { console.error('[Stream] react', err); }
    setReacting(null);
  }

  // ── check read status
  function seenByOther(msg: Msg): boolean {
    return Object.entries(reads).some(([uid, r]) => {
      if (uid === currentUserId) return false;
      const readAt = new Date(r.last_read as unknown as string).getTime();
      const sentAt = new Date(msg.created_at as unknown as string).getTime();
      return readAt >= sentAt;
    });
  }

  // ── header info
  const members = Object.values(channel.state.members);
  const other   = members.find(m => m.user?.id !== currentUserId);
  const name    = other?.user?.name
    ?? (channel.data?.recipient_name as string | undefined)
    ?? (isAr ? 'محادثة' : 'Chat');
  const color   = avatarColor(name);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 shrink-0
                      border-b border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
          <span className="text-sm font-bold text-white">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{name}</p>
          <p className="text-xs font-medium text-[#A0CD39]">{isAr ? 'نشطة' : 'Active'}</p>
        </div>
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-lg text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* ── Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-10">
            {isAr ? 'ابدأ المحادثة...' : 'Start the conversation...'}
          </p>
        )}

        {messages.map(msg => {
          const isOwn     = msg.user?.id === currentUserId;
          const seen      = isOwn && seenByOther(msg);
          const rxCounts  = msg.reaction_counts ?? {};
          const hasReacts = Object.keys(rxCounts).length > 0;

          return (
            <div key={msg.id}
              className={`group flex items-end gap-1.5 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>

              {/* ＋ button — other's messages */}
              {!isOwn && (
                <div className="shrink-0 self-end pb-5" data-reaction>
                  <button type="button"
                    onClick={e => {
                      if (reacting?.id === msg.id) { setReacting(null); return; }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const left = Math.max(8, Math.min(rect.left - 10, window.innerWidth - 260));
                      setReacting({ id: msg.id, top: rect.top - 52, left });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700
                               flex items-center justify-center text-xs
                               text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    ＋
                  </button>
                </div>
              )}

              {/* Bubble column */}
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>

                {/* Bubble */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                 ${isOwn
                                   ? 'bg-[#A0CD39] text-gray-900 rounded-ee-sm'
                                   : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-es-sm'}`}>
                  {msg.text && <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>}

                  {/* Images */}
                  {msg.attachments?.filter(a => a.type === 'image').map((att, i) => (
                    <img key={i}
                      src={att.image_url ?? att.thumb_url}
                      alt={att.title ?? ''}
                      onClick={() => att.image_url && window.open(att.image_url, '_blank')}
                      className="mt-1 max-w-full max-h-60 rounded-lg object-cover cursor-pointer" />
                  ))}

                  {/* Files */}
                  {msg.attachments?.filter(a => a.type === 'file').map((att, i) => (
                    <a key={i} href={att.asset_url} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-lg text-xs transition-colors
                                  ${isOwn
                                    ? 'bg-black/10 hover:bg-black/15'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate max-w-40">{att.title}</span>
                      {att.file_size && (
                        <span className="shrink-0 opacity-50 ms-auto">{fmtSize(att.file_size as number)}</span>
                      )}
                    </a>
                  ))}
                </div>

                {/* Reactions row */}
                {hasReacts && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(rxCounts).map(([type, count]) => {
                      const emoji = TYPE_TO_EMOJI[type] ?? type;
                      const owned = msg.own_reactions?.some(r => r.type === type);
                      return (
                        <button key={type} type="button" onClick={() => void react(msg.id, emoji)}
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border transition-colors
                                      ${owned
                                        ? 'bg-[#D8EBAE] border-[#A0CD39] dark:bg-[#A0CD39]/20 dark:border-[#A0CD39]/50'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          {emoji}
                          <span className="ms-0.5 text-gray-500 dark:text-gray-400">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Time + read receipt */}
                <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {msg.created_at && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {fmtTime(msg.created_at as Date | string, isAr)}
                    </span>
                  )}
                  {isOwn && (
                    seen
                      ? <CheckCheck size={12} className="text-[#A0CD39]" />
                      : <Check      size={12} className="text-gray-400"  />
                  )}
                </div>
              </div>

              {/* ＋ button — own messages */}
              {isOwn && (
                <div className="shrink-0 self-end pb-5" data-reaction>
                  <button type="button"
                    onClick={e => {
                      if (reacting?.id === msg.id) { setReacting(null); return; }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const left = Math.max(8, Math.min(rect.right - 250, window.innerWidth - 260));
                      setReacting({ id: msg.id, top: rect.top - 52, left });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700
                               flex items-center justify-center text-xs
                               text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    ＋
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area */}
      <div className="shrink-0 border-t border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900">

        {/* Emoji picker — in normal flow, no absolute positioning needed */}
        {showEmoji && (
          <div data-emoji className="border-b border-gray-100 dark:border-gray-700/60">
            <EmojiPicker
              theme={isDark ? Theme.DARK : Theme.LIGHT}
              onEmojiClick={(ev: EmojiClickData) => {
                setText(p => p + ev.emoji);
                inputRef.current?.focus();
              }}
              width="100%"
              height={340}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              lazyLoadEmojis
            />
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3">

          {/* Paperclip */}
          <button type="button" onClick={() => fileRef.current?.click()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
            <Paperclip size={18} />
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
                 accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />

          {/* Emoji toggle */}
          <button type="button" data-emoji onClick={() => setShowEmoji(p => !p)}
            className={`p-2 rounded-lg transition-colors shrink-0
                        ${showEmoji
                          ? 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/20 text-[#709028]'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Smile size={18} />
          </button>

          {/* Text input */}
          <input ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-200
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40" />

          {/* Send */}
          <button type="button" onClick={() => void send()}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center text-white shrink-0
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={16} className={isAr ? 'scale-x-[-1]' : ''} />
          </button>
        </div>
      </div>

      {/* ── Reaction popup — fixed to viewport, avoids overflow clipping */}
      {reacting && (
        <div
          data-reaction
          style={{ position: 'fixed', top: reacting.top, left: reacting.left }}
          className="z-200 flex gap-1 p-1.5 rounded-2xl
                     bg-white dark:bg-gray-800 shadow-xl
                     border border-gray-100 dark:border-gray-700">
          {REACTIONS.map(e => (
            <button key={e} type="button" onClick={() => void react(reacting.id, e)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-base
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
