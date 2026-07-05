import { useEffect, useRef, useState } from 'react';
import { AtSign, FileText, MessageSquare, Paperclip, Send } from 'lucide-react';
import { useLang }               from '@/app/providers/LanguageProvider';
import { useAuth }               from '@/modules/auth/context/AuthContext';
import { EmpConversationList }   from '@/modules/employee/messages/components/EmpConversationList';
import type { EmpConversation }  from '@/modules/employee/messages/types/messages.types';
import {
  useSeoConversations, useSeoMessages, useSendSeoMessage, useMarkSeoRead, useSeoMentionables,
} from '../hooks/useSeoMessages';
import type { SeoMessage } from '../types/messages.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(msg: SeoMessage, isAr: boolean) {
  const raw = msg.sentAt ?? msg.created_at;
  if (msg.sentTime) return msg.sentTime;
  if (!raw) return '';
  return new Date(raw.replace(' ', 'T')).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Chat window ────────────────────────────────────────────────────────────

interface ChatProps {
  conversation: EmpConversation;
  isAr:         boolean;
}

function SeoMemberChatWindow({ conversation, isAr }: ChatProps) {
  const { user }  = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const currentUserId = user?.employeeId ?? user?.id ?? '';

  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const { data: messages = [], isLoading } = useSeoMessages(conversation.id);
  const { mutate: sendText, isPending: sending } = useSendSeoMessage(conversation.id);
  const { mutate: markRead } = useMarkSeoRead();
  const { data: mentionables = [] } = useSeoMentionables(showMentions);

  useEffect(() => {
    if (conversation.id) markRead(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const body = text.trim();
    if (!body || sending) return;
    setText('');
    sendText(body);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function insertMention(name: string) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${name} `);
    setShowMentions(false);
  }

  const convName = conversation.name ?? (isAr ? 'محادثة' : 'Chat');
  const initial  = convName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5
                      border-b border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900">
        <div className="w-9 h-9 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-gray-900">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{convName}</p>
          <p className="text-[11px] text-[#709028] dark:text-[#A0CD39]">
            {isAr ? 'محادثات المشاريع' : 'Project conversations'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50 dark:bg-gray-950">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
              <div className="h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 w-48" />
            </div>
          ))
        ) : messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            {isAr ? 'ابدأ المحادثة...' : 'Start the conversation...'}
          </p>
        ) : (
          messages.map(msg => {
            const isOwn = msg.isMine ?? (msg.sender.id === currentUserId);
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
                <div className={[
                  'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                  isOwn
                    ? 'bg-[#A0CD39] text-gray-900 rounded-ss-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-se-sm',
                ].join(' ')}>

                  {msg.attachments?.map((att, i) => (
                    <div key={i} className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs
                                            ${isOwn ? 'bg-white/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate max-w-37.5">{att.name ?? att.fileName ?? 'file'}</span>
                      {att.size != null && <span className="shrink-0 opacity-60">{fmtSize(att.size)}</span>}
                    </div>
                  ))}

                  {msg.body && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.body}</p>
                  )}

                  <p className={`text-[10px] mt-1 text-end ${isOwn ? 'text-gray-700/70' : 'text-gray-400'}`}>
                    {fmtTime(msg, isAr)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900 relative">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center transition-colors shrink-0
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} className="text-gray-900" style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
            )}
          </button>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
            className="flex-1 resize-none py-2.5 px-3 text-sm rounded-xl
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40
                       max-h-28 overflow-y-auto"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMentions(o => !o)}
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors"
            >
              <AtSign size={16} />
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
                    onClick={() => insertMention(m.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-end
                               text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors"
          >
            <Paperclip size={16} />
          </button>
          <input ref={fileRef} type="file" className="hidden" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SeoMemberMessagesPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';

  const [activeConv, setActiveConv] = useState<EmpConversation | null>(null);
  const { data: conversations = [], isLoading } = useSeoConversations();

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="-m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                 bg-white dark:bg-gray-900 rounded-none"
    >
      {/* Chat window */}
      <div className="flex-1 min-w-0 flex flex-col">
        {activeConv ? (
          <SeoMemberChatWindow conversation={activeConv} isAr={isAr} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 select-none">
            <div className="w-16 h-16 rounded-full bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10
                            flex items-center justify-center">
              <MessageSquare size={28} className="text-[#A0CD39]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isAr ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isAr ? 'رسائلك مع المشاريع والفريق' : 'Your project and team messages'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conversation list */}
      <div className="w-72 shrink-0 flex flex-col">
        <EmpConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          loading={isLoading}
          isAr={isAr}
          onSelect={conv => setActiveConv(conv)}
        />
      </div>
    </div>
  );
}
