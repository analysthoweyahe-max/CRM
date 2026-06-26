import { useEffect, useRef } from 'react';
import { Check, CheckCheck, FileText } from 'lucide-react';
import type { ApiMessage } from '../types/messages.types';

const AVATAR_COLORS = ['bg-red-400','bg-blue-400','bg-green-500','bg-purple-400','bg-yellow-400','bg-pink-400','bg-indigo-400','bg-teal-400'];
export function avatarColor(s: string) { return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]; }

function fmtTime(raw: string, isAr: boolean) {
  return new Date(raw).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBubble({ msg, isOwn, isAr }: { msg: ApiMessage; isOwn: boolean; isAr: boolean }) {
  const seen = !!msg.read_at;
  return (
    <div className={`flex items-end gap-1.5 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                         ${isOwn
                           ? 'bg-[#A0CD39] text-gray-900 rounded-ee-sm'
                           : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-es-sm'}`}>
          {msg.body && <p className="whitespace-pre-wrap wrap-break-word">{msg.body}</p>}

          {msg.attachments?.filter(a => a.type === 'image').map((att, i) => (
            <img key={i} src={att.url} alt={att.name ?? ''}
              onClick={() => window.open(att.url, '_blank')}
              className="mt-1 max-w-full max-h-60 rounded-lg object-cover cursor-pointer" />
          ))}

          {msg.attachments?.filter(a => a.type !== 'image').map((att, i) => (
            <a key={i} href={att.url} target="_blank" rel="noreferrer"
              className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-lg text-xs transition-colors
                          ${isOwn ? 'bg-black/10 hover:bg-black/15'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <FileText size={14} className="shrink-0" />
              <span className="truncate max-w-40">{att.name}</span>
              {att.size && <span className="shrink-0 opacity-50 ms-auto">{fmtSize(att.size)}</span>}
            </a>
          ))}
        </div>

        <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{fmtTime(msg.created_at, isAr)}</span>
          {isOwn && (seen
            ? <CheckCheck size={12} className="text-[#A0CD39]" />
            : <Check      size={12} className="text-gray-400"  />
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  messages:      ApiMessage[];
  currentUserId: string;
  isAr:          boolean;
}

export function MessageList({ messages, currentUserId, isAr }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-1">
      {messages.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-10">
          {isAr ? 'ابدأ المحادثة...' : 'Start the conversation...'}
        </p>
      )}
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender.id === currentUserId} isAr={isAr} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
