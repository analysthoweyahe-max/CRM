import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Send, Paperclip, AtSign, FileText } from 'lucide-react';
import { useAuth }           from '@/modules/auth/context/AuthContext';
import { useEmpMessages, useEmpSendMessage, useEmpSendMedia, useEmpMarkRead } from '../hooks/useEmployeeMessages';
import type { EmpConversation, EmpMessage } from '../types/messages.types';

function fmtTime(raw: string, isAr: boolean) {
  return new Date(raw).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  conversation: EmpConversation;
  isAr:         boolean;
}

export function EmpChatWindow({ conversation, isAr }: Props) {
  const { user }   = useAuth();
  const bottomRef  = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');

  const { data: messages = [], isLoading } = useEmpMessages(conversation.id);
  const { mutate: sendText,  isPending: sending  } = useEmpSendMessage(conversation.id);
  const { mutate: sendMedia, isPending: uploading } = useEmpSendMedia(conversation.id);
  const { mutate: markRead }                        = useEmpMarkRead();

  // mark as read when conversation opens
  useEffect(() => {
    if (conversation.id) markRead(conversation.id);
  }, [conversation.id]);

  // scroll to bottom on new messages
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    sendMedia(file);
    e.target.value = '';
  }

  const convName = conversation.name ?? conversation.participants?.[0]?.name ?? (isAr ? 'محادثة' : 'Chat');
  const initial  = convName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
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

      {/* ── Messages ── */}
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
          messages.map(msg => <MessageBubble key={msg.id} msg={msg} isAr={isAr} currentUserId={user?.employeeId ?? user?.id ?? ''} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900">
        <div className="flex items-end gap-2">
          {/* Send button */}
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

          {/* Text area */}
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

          {/* @ mention */}
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors"
          >
            <AtSign size={16} />
          </button>

          {/* Attach file */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors
                       disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-3.5 h-3.5 border-2 border-[#709028] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip size={16} />
            )}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}

/* ── Single message bubble ── */
function MessageBubble({ msg, isAr, currentUserId }: { msg: EmpMessage; isAr: boolean; currentUserId: string }) {
  const isOwn = msg.isMine ?? (msg.sender?.id === currentUserId);
  const timestamp = msg.sentAt ?? msg.created_at ?? '';

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
      <div className={[
        'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
        isOwn
          ? 'bg-[#A0CD39] text-gray-900 rounded-ss-sm'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-se-sm',
      ].join(' ')}>

        {/* Attachments */}
        {msg.attachments?.map((att, i) => (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs
                        ${isOwn ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate max-w-[150px]">{att.name}</span>
            {att.size && <span className="shrink-0 opacity-60">{fmtSize(att.size)}</span>}
          </a>
        ))}

        {/* Body */}
        {msg.body && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-gray-700/70' : 'text-gray-400'} text-end`}>
          {fmtTime(timestamp, isAr)}
        </p>
      </div>
    </div>
  );
}
