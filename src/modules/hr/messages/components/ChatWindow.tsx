import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Send, Paperclip, Smile, Check, CheckCheck, Menu, Lock } from 'lucide-react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ChatAttachments, MessageBodyText } from '@/shared/components/chat';
import { useMessages, useSendMessage, useSendMedia, useMarkRead, useUpdateConversationStatus } from '../hooks/useMessages';
import { conversationMessageId } from '../utils/message.utils';
import type { ApiConversation, ApiMessage } from '../types/messages.types';

interface Props {
  conversation:   ApiConversation;
  currentUserId:  string;
  isAr:           boolean;
  onOpenSidebar?: () => void;
}

const AVATAR_COLORS = [
  'bg-red-400','bg-blue-400','bg-green-500','bg-purple-400',
  'bg-yellow-400','bg-pink-400','bg-indigo-400','bg-teal-400',
];

function avatarColor(s: string) { return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]; }

function messageTimestamp(msg: ApiMessage): string {
  return msg.sentAt ?? msg.created_at ?? '';
}

function isOwnMessage(msg: ApiMessage, currentUserId: string): boolean {
  if (msg.isMine !== undefined) return msg.isMine;
  if (msg.sender?.id) return msg.sender.id === currentUserId;
  return false;
}

function fmtTime(raw: string, isAr: boolean) {
  if (!raw) return '';
  return new Date(raw).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

export function ChatWindow({ conversation, currentUserId, isAr, onOpenSidebar }: Props) {
  const [text,      setText]      = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const { isDark } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading, isError, refetch, isFetching } = useMessages(conversation);
  const { mutate: sendText,  isPending: sending   } = useSendMessage(conversation);
  const { mutate: sendMedia, isPending: uploading } = useSendMedia(conversation);
  const { mutate: markRead } = useMarkRead();
  const { mutate: updateStatus, isPending: closing } = useUpdateConversationStatus(conversation);

  const [localStatus, setLocalStatus] = useState(conversation.status);
  useEffect(() => { setLocalStatus(conversation.status); }, [conversation.status, conversation.id]);

  const isClosed = localStatus === 'closed';

  const messageConvId = conversationMessageId(conversation);

  // mark as read when a conversation opens
  useEffect(() => {
    if (messageConvId) markRead(messageConvId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageConvId]);

  // auto-scroll on new messages
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // close emoji picker on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-emoji]')) setShowEmoji(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  function send() {
    const t = text.trim();
    if (!t || sending) return;
    setText('');
    sendText(t);
    inputRef.current?.focus();
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    sendMedia(file);
  }

  const participants = conversation.participants ?? [];
  const other = participants.find(p => p.id !== currentUserId) ?? participants[0];
  const name  = conversation.employeeName ?? conversation.subject ?? other?.name ?? (isAr ? 'محادثة' : 'Chat');
  const color = avatarColor(name);

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
          {conversation.subject && conversation.employeeName && (
            <p className="text-[11px] text-gray-400 truncate">{conversation.subject}</p>
          )}
        </div>
        {!isClosed && (
          <button
            type="button"
            onClick={() => updateStatus('closed', { onSuccess: () => setLocalStatus('closed') })}
            disabled={closing}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                       text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title={isAr ? 'إغلاق المحادثة' : 'Close conversation'}
          >
            <Lock size={14} />
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        )}
        {isClosed && (
          <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0">
            {isAr ? 'مغلقة' : 'Closed'}
          </span>
        )}
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
              <div className="h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 w-48" />
            </div>
          ))
        ) : isError ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs text-red-500">
              {isAr ? 'تعذّر تحميل الرسائل. حاول مرة أخرى.' : 'Failed to load messages. Please try again.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-[#709028] hover:underline disabled:opacity-50"
            >
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-10">
            {isAr ? 'ابدأ المحادثة...' : 'Start the conversation...'}
          </p>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={String(msg.id)}
              msg={msg}
              isAr={isAr}
              isOwn={isOwnMessage(msg, currentUserId)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area */}
      {isClosed ? (
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <Lock size={14} />
            {isAr ? 'المحادثة مغلقة — لا يمكن إرسال رسائل جديدة' : 'Conversation closed — cannot send new messages'}
          </p>
        </div>
      ) : (
      <div className="shrink-0 border-t border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900">

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
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 disabled:opacity-50"
          >
            {uploading
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <Paperclip size={18} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFile}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          />

          {/* Emoji toggle */}
          <button
            type="button"
            data-emoji
            onClick={() => setShowEmoji(p => !p)}
            className={`p-2 rounded-lg transition-colors shrink-0
                        ${showEmoji
                          ? 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/20 text-[#709028]'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Smile size={18} />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-200
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40"
          />

          {/* Send */}
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center text-white shrink-0
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className={isAr ? 'scale-x-[-1]' : ''} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

/* ── Single message bubble ── */
function MessageBubble({ msg, isAr, isOwn }: { msg: ApiMessage; isAr: boolean; isOwn: boolean }) {
  const seen = isOwn && !!msg.read_at;

  return (
    <div className={`flex items-end gap-1.5 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>

        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                         ${isOwn
                           ? 'bg-[#A0CD39] text-gray-900 rounded-ee-sm'
                           : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-es-sm'}`}>
          {msg.body && (
            <MessageBodyText
              text={msg.body}
              className="whitespace-pre-wrap wrap-break-word"
              linkClassName={isOwn
                ? 'underline break-all text-gray-900 hover:opacity-80'
                : 'underline break-all text-[#709028] dark:text-[#A0CD39] hover:opacity-80'}
            />
          )}

          <ChatAttachments attachments={msg.attachments ?? []} isOwn={isOwn} />
        </div>

        <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{fmtTime(messageTimestamp(msg), isAr)}</span>
          {isOwn && (
            seen
              ? <CheckCheck size={12} className="text-[#A0CD39]" />
              : <Check      size={12} className="text-gray-400"  />
          )}
        </div>
      </div>
    </div>
  );
}
