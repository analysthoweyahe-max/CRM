import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AtSign, FileText, MessageSquare, Paperclip, Send, Users } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { setOpenConversation } from '@/shared/realtime-messages';
import { extractApiError } from '@/shared/utils/error.utils';
import { CreateSeoGroupModal } from '../components/CreateSeoGroupModal';
import { NewSeoConversationModal } from '../components/NewSeoConversationModal';
import { SeoConversationList } from '../components/SeoConversationList';
import { SeoGroupMembersPanel } from '../components/SeoGroupMembersPanel';
import {
  useSeoConversations,
  useSeoConversation,
  useSeoMessages,
  useSendSeoMessage,
  useMarkSeoRead,
  useSeoMentionables,
  useCreateSeoConversation,
} from '../hooks/useSeoMessages';
import type {
  SeoConversation,
  SeoConversationType,
  SeoMentionable,
  SeoMessage,
} from '../types/messages.types';

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

function conversationTitle(conv: SeoConversation, isAr: boolean) {
  if (conv.type === 'group') {
    return conv.name?.trim() || (isAr ? 'جروب' : 'Group');
  }
  return conv.participant?.name?.trim() || conv.name?.trim() || (isAr ? 'محادثة' : 'Chat');
}

interface ChatProps {
  conversation: SeoConversation;
  isAr:         boolean;
  onConversationUpdate: (conv: SeoConversation) => void;
  onLeftGroup: () => void;
}

function SeoMemberChatWindow({ conversation, isAr, onConversationUpdate, onLeftGroup }: ChatProps) {
  const { user }  = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  /** Backend sender.id is the actor UUID — match AuthUser.id, not employeeNumber. */
  const currentUserId = user?.id ?? '';

  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const isGroup = conversation.type === 'group';

  const { data: detail } = useSeoConversation(conversation.id, isGroup && showMembers);
  const liveConversation = detail ?? conversation;

  const { data: messages = [], isLoading } = useSeoMessages(conversation.id);
  const { mutate: sendText, isPending: sending } = useSendSeoMessage(conversation.id);
  const { mutate: markRead } = useMarkSeoRead();
  const { data: mentionables = [] } = useSeoMentionables(showMentions);

  useEffect(() => {
    setOpenConversation(conversation.id, 'company');
    return () => setOpenConversation(null);
  }, [conversation.id]);

  useEffect(() => {
    if (conversation.id) markRead(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setShowMembers(false);
    setText('');
    setShowMentions(false);
  }, [conversation.id]);

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

  const convName = conversationTitle(liveConversation, isAr);
  const initial  = convName.charAt(0).toUpperCase();
  const subtitle = isGroup
    ? `${liveConversation.participantCount ?? liveConversation.participants?.length ?? 0} ${isAr ? 'أعضاء' : 'members'}`
    : (isAr ? 'محادثة مباشرة' : 'Direct chat');

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3.5
                      border-b border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900">
        <div className="w-9 h-9 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-gray-900">{initial}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{convName}</p>
          <p className="text-[11px] text-[#709028] dark:text-[#A0CD39]">{subtitle}</p>
        </div>
        {isGroup && (
          <button
            type="button"
            onClick={() => setShowMembers(o => !o)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              showMembers
                ? 'bg-[#D8EBAE] text-[#709028]'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            <Users size={14} />
            {isAr ? 'الأعضاء' : 'Members'}
          </button>
        )}
      </div>

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
                  {!isOwn && isGroup && (
                    <p className="text-[11px] font-semibold text-[#709028] dark:text-[#A0CD39] mb-0.5">
                      {msg.sender.name}
                    </p>
                  )}

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
                    key={`${m.type}:${m.id}`}
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

      {isGroup && showMembers && (
        <SeoGroupMembersPanel
          conversation={liveConversation}
          currentUserId={currentUserId}
          isAr={isAr}
          onClose={() => setShowMembers(false)}
          onLeft={onLeftGroup}
          onUpdated={onConversationUpdate}
        />
      )}
    </div>
  );
}

type TypeFilter = 'all' | SeoConversationType;

export function SeoMemberMessagesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { user, isSuperAdmin, hasAnyRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const canCreateGroup =
    isSuperAdmin
    || user?.actor === 'admin'
    || hasAnyRole(['super-admin', 'seo-manager', 'hr-manager', 'project-manager', 'seo-leader', 'hr', 'manager', 'admin']);

  const [activeConv, setActiveConv] = useState<SeoConversation | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSeoConversations({ type: typeFilter });
  const { mutateAsync: createConversation, isPending: creatingChat } = useCreateSeoConversation(isAr);

  const deepLinkId = searchParams.get('conversation');
  const { data: deepLinkConv } = useSeoConversation(
    deepLinkId && !activeConv ? deepLinkId : null,
    !!deepLinkId && !activeConv,
  );

  useEffect(() => {
    if (!deepLinkConv) return;
    setActiveConv(deepLinkConv);
    setSearchParams({}, { replace: true });
  }, [deepLinkConv, setSearchParams]);

  useEffect(() => {
    if (!activeConv) return;
    const fresh = conversations.find(c => c.id === activeConv.id);
    if (fresh) setActiveConv(fresh);
  }, [conversations, activeConv?.id]);

  async function handleStartChat(person: SeoMentionable) {
    if (creatingChat) return;
    try {
      const conv = await createConversation({
        recipient_type: person.type,
        recipient_id: person.id,
      });
      setActiveConv(conv);
      setShowNewChat(false);
      setTypeFilter('all');
    } catch {
      /* toast in hook */
    }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="-m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                 bg-white dark:bg-gray-900 rounded-none"
    >
      <div className="flex-1 min-w-0 flex flex-col">
        {activeConv ? (
          <SeoMemberChatWindow
            conversation={activeConv}
            isAr={isAr}
            onConversationUpdate={setActiveConv}
            onLeftGroup={() => setActiveConv(null)}
          />
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
                {isAr ? 'محادثات مباشرة وجروبات الفريق' : 'Direct chats and team groups'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-72 shrink-0 flex flex-col">
        <SeoConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          loading={isLoading}
          error={isError}
          errorMessage={isError ? extractApiError(error) : undefined}
          onRetry={() => { void refetch(); }}
          isAr={isAr}
          typeFilter={typeFilter}
          onTypeFilter={setTypeFilter}
          onSelect={setActiveConv}
          onNewChat={() => setShowNewChat(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          canCreateGroup={canCreateGroup}
        />
      </div>

      {showNewChat && (
        <NewSeoConversationModal
          isAr={isAr}
          loading={creatingChat}
          onSelect={handleStartChat}
          onClose={() => setShowNewChat(false)}
        />
      )}

      {canCreateGroup && (
        <CreateSeoGroupModal
          open={showCreateGroup}
          isAr={isAr}
          onClose={() => setShowCreateGroup(false)}
          onCreated={conv => {
            setActiveConv(conv);
            setTypeFilter('all');
          }}
        />
      )}
    </div>
  );
}
