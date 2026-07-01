import { useEffect, useRef, useState } from 'react';
import { AtSign, FileText, MessageSquare, Paperclip, Send } from 'lucide-react';
import { useLang }               from '@/app/providers/LanguageProvider';
import { EmpConversationList }   from '@/modules/employee/messages/components/EmpConversationList';
import type { EmpConversation }  from '@/modules/employee/messages/types/messages.types';

// ─── Dummy data ───────────────────────────────────────────────────────────────

const ME_ID = 'seo-me';

interface DummyMessage {
  id:           string;
  body:         string;
  sender:       { id: string; name: string };
  created_at:   string;
  attachment?:  { name: string; size: number };
}

const DUMMY_CONVERSATIONS: EmpConversation[] = [
  {
    id:           'c1',
    name:         'حملة برند إكس',
    unread_count: 3,
    last_message: { body: 'تم رفع التقرير الأسبوعي', created_at: '2026-07-01T10:30:00' },
  },
  {
    id:           'c2',
    name:         'حملة الإلكترونيات',
    unread_count: 0,
    last_message: { body: 'شكراً على المتابعة', created_at: '2026-07-01T09:15:00' },
  },
  {
    id:           'c3',
    name:         'مشروع التجارة الإلكترونية',
    unread_count: 1,
    last_message: { body: 'محتاج تعديل على الكلمات', created_at: '2026-06-30T18:00:00' },
  },
  {
    id:           'c4',
    name:         'حملة المنتج الجديد',
    unread_count: 0,
    last_message: { body: 'ممتاز، استمر', created_at: '2026-06-30T14:00:00' },
  },
];

const DUMMY_MESSAGES: Record<string, DummyMessage[]> = {
  c1: [
    { id: 'm1', body: 'مرحباً، تم مراجعة التقرير الأسبوعي وهناك بعض التعديلات المطلوبة',          sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-07-01T09:00:00' },
    { id: 'm2', body: 'تمام، سأقوم بالتعديل فوراً',                                               sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-07-01T09:05:00' },
    { id: 'm3', body: 'نحتاج أيضاً لزيادة كثافة الكلمات المفتاحية في الصفحة الرئيسية',           sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-07-01T09:15:00' },
    { id: 'm4', body: '',                                                                           sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-07-01T09:20:00', attachment: { name: 'SEO_Report_Week23.pdf', size: 2411724 } },
    { id: 'm5', body: 'تم الاطلاع على الملف، سأبدأ العمل عليه الآن',                              sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-07-01T09:30:00' },
    { id: 'm6', body: 'هل هناك أولوية لصفحات معينة؟',                                             sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-07-01T09:31:00' },
    { id: 'm7', body: 'تم رفع التقرير الأسبوعي',                                                  sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-07-01T10:30:00' },
  ],
  c2: [
    { id: 'm1', body: 'كيف تسير حملة الإلكترونيات؟',                                              sender: { id: 'leader2', name: 'سارة محمد' },    created_at: '2026-07-01T08:00:00' },
    { id: 'm2', body: 'الأمور تسير بشكل جيد، وصلنا لـ 85% من الهدف',                             sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-07-01T08:30:00' },
    { id: 'm3', body: 'شكراً على المتابعة',                                                        sender: { id: 'leader2', name: 'سارة محمد' },    created_at: '2026-07-01T09:15:00' },
  ],
  c3: [
    { id: 'm1', body: 'محتاج تعديل على الكلمات المفتاحية للصفحة',                                 sender: { id: 'leader3', name: 'خالد إبراهيم' }, created_at: '2026-06-30T17:00:00' },
    { id: 'm2', body: 'حسناً، أي كلمات تحديداً؟',                                                 sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-06-30T17:30:00' },
    { id: 'm3', body: 'محتاج تعديل على الكلمات',                                                   sender: { id: 'leader3', name: 'خالد إبراهيم' }, created_at: '2026-06-30T18:00:00' },
  ],
  c4: [
    { id: 'm1', body: 'عمل رائع على حملة المنتج الجديد',                                           sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-06-30T13:00:00' },
    { id: 'm2', body: 'شكراً جزيلاً!',                                                             sender: { id: ME_ID,    name: 'أنا' },            created_at: '2026-06-30T13:15:00' },
    { id: 'm3', body: 'ممتاز، استمر',                                                              sender: { id: 'leader1', name: 'أحمد السيد' },   created_at: '2026-06-30T14:00:00' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(raw: string, isAr: boolean) {
  return new Date(raw).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Dummy Chat Window ────────────────────────────────────────────────────────

interface ChatProps {
  conversation: EmpConversation;
  isAr:         boolean;
}

function SeoMemberChatWindow({ conversation, isAr }: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [text, setText]       = useState('');
  const [messages, setMessages] = useState<DummyMessage[]>(
    () => DUMMY_MESSAGES[conversation.id] ?? [],
  );

  useEffect(() => {
    setMessages(DUMMY_MESSAGES[conversation.id] ?? []);
    setText('');
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const body = text.trim();
    if (!body) return;
    setMessages(prev => [
      ...prev,
      { id: String(Date.now()), body, sender: { id: ME_ID, name: 'أنا' }, created_at: new Date().toISOString() },
    ]);
    setText('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
        {messages.map(msg => {
          const isOwn = msg.sender.id === ME_ID;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
              <div className={[
                'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                isOwn
                  ? 'bg-[#A0CD39] text-gray-900 rounded-ss-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-se-sm',
              ].join(' ')}>

                {/* Attachment */}
                {msg.attachment && (
                  <div className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs
                                   ${isOwn ? 'bg-white/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                    <FileText size={14} className="shrink-0" />
                    <span className="truncate max-w-37.5">{msg.attachment.name}</span>
                    <span className="shrink-0 opacity-60">{fmtSize(msg.attachment.size)}</span>
                  </div>
                )}

                {/* Body */}
                {msg.body && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.body}</p>
                )}

                {/* Timestamp */}
                <p className={`text-[10px] mt-1 text-end ${isOwn ? 'text-gray-700/70' : 'text-gray-400'}`}>
                  {fmtTime(msg.created_at, isAr)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900">
        <div className="flex items-end gap-2">
          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center transition-colors shrink-0
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-gray-900" style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
          </button>

          {/* Input */}
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

          {/* Attach */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
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
          conversations={DUMMY_CONVERSATIONS}
          activeId={activeConv?.id ?? null}
          loading={false}
          isAr={isAr}
          onSelect={conv => setActiveConv(conv)}
        />
      </div>
    </div>
  );
}
