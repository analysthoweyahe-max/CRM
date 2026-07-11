import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AtSign,
  MessageSquare,
  Paperclip,
  Reply,
  Send,
  Smile,
  Users,
  X,
} from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ChatAttachments, MessageBodyText } from '@/shared/components/chat';
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
  useReactSeoMessage,
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

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

function fmtTime(msg: SeoMessage, isAr: boolean) {
  const raw = msg.sentAt ?? msg.created_at;
  if (msg.sentTime) return msg.sentTime;
  if (!raw) return '';
  return new Date(raw.replace(' ', 'T')).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function conversationTitle(conv: SeoConversation, isAr: boolean) {
  if (conv.type === 'group') {
    return conv.name?.trim() || (isAr ? 'جروب' : 'Group');
  }
  return conv.participant?.name?.trim() || conv.name?.trim() || (isAr ? 'محادثة' : 'Chat');
}

function replyPreview(msg: SeoMessage) {
  return msg.replyTo ?? msg.reply_to ?? null;
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
  const [replyTo, setReplyTo] = useState<SeoMessage | null>(null);
  const [reactionFor, setReactionFor] = useState<string | null>(null);

  const isGroup = conversation.type === 'group';

  const { data: detail } = useSeoConversation(conversation.id, isGroup && showMembers);
  const liveConversation = detail ?? conversation;

  const { data: messages = [], isLoading } = useSeoMessages(conversation.id);
  const { mutate: sendMessage, isPending: sending } = useSendSeoMessage(conversation.id);
  const { mutate: reactToMessage, isPending: reacting } = useReactSeoMessage(conversation.id);
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
    setReplyTo(null);
    setReactionFor(null);
  }, [conversation.id]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-reaction-menu]')) setReactionFor(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function handleSend() {
    const body = text.trim();
    if ((!body && !replyTo) || sending) return;
    if (!body) return;
    setText('');
    const parentId = replyTo?.id;
    setReplyTo(null);
    sendMessage({
      body,
      ...(parentId != null ? { reply_to: parentId } : {}),
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function insertMention(name: string) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${name} `);
    setShowMentions(false);
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || sending) return;
    sendMessage({
      body: text.trim() || undefined,
      file,
      ...(replyTo?.id != null ? { reply_to: replyTo.id } : {}),
    });
    setText('');
    setReplyTo(null);
  }

  function handleReact(messageId: number | string, emoji: string) {
    setReactionFor(null);
    reactToMessage({ messageId, emoji });
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
            const quoted = replyPreview(msg);
            const msgKey = String(msg.id);

            return (
              <div key={msg.id} className={`group flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
                <div className="relative max-w-[70%]">
                  <div className={[
                    'rounded-2xl px-4 py-2.5 shadow-sm',
                    isOwn
                      ? 'bg-[#A0CD39] text-gray-900 rounded-ss-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-se-sm',
                  ].join(' ')}>
                    {!isOwn && isGroup && (
                      <p className="text-[11px] font-semibold text-[#709028] dark:text-[#A0CD39] mb-0.5">
                        {msg.sender.name}
                      </p>
                    )}

                    {quoted && (
                      <div className={`mb-2 px-2.5 py-1.5 rounded-lg border-s-2 text-[11px] leading-snug
                                      ${isOwn
                                        ? 'bg-white/25 border-gray-700/40'
                                        : 'bg-gray-50 dark:bg-gray-700/60 border-[#A0CD39]'}`}>
                        <p className="font-semibold opacity-80 truncate">
                          {quoted.sender?.name ?? (isAr ? 'رسالة' : 'Message')}
                        </p>
                        <p className="opacity-70 line-clamp-2 whitespace-pre-wrap">
                          {quoted.body?.trim() || (isAr ? 'مرفق' : 'Attachment')}
                        </p>
                      </div>
                    )}

                    <ChatAttachments attachments={msg.attachments ?? []} isOwn={isOwn} />

                    {msg.body && (
                      <MessageBodyText
                        text={msg.body}
                        linkClassName={isOwn
                          ? 'underline break-all text-gray-900 hover:opacity-80'
                          : 'underline break-all text-[#709028] dark:text-[#A0CD39] hover:opacity-80'}
                      />
                    )}

                    {(msg.reactions?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {msg.reactions!.map(r => (
                          <button
                            key={r.emoji}
                            type="button"
                            disabled={reacting}
                            onClick={() => handleReact(msg.id, r.emoji)}
                            className={`px-1.5 py-0.5 rounded-full text-[11px] border transition-colors
                                        ${r.reactedByMe
                                          ? 'bg-white/50 border-gray-700/30'
                                          : 'bg-black/5 dark:bg-white/10 border-transparent hover:border-gray-300'}`}
                          >
                            {r.emoji}{(r.count ?? 0) > 1 ? ` ${r.count}` : ''}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className={`text-[10px] mt-1 text-end ${isOwn ? 'text-gray-700/70' : 'text-gray-400'}`}>
                      {fmtTime(msg, isAr)}
                    </p>
                  </div>

                  <div className={`absolute -top-2 ${isOwn ? 'end-0' : 'start-0'}
                                  flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <button
                      type="button"
                      title={isAr ? 'رد' : 'Reply'}
                      onClick={() => setReplyTo(msg)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600
                                 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#709028]"
                    >
                      <Reply size={12} />
                    </button>
                    <div className="relative" data-reaction-menu>
                      <button
                        type="button"
                        title={isAr ? 'تفاعل' : 'React'}
                        onClick={() => setReactionFor(prev => (prev === msgKey ? null : msgKey))}
                        className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600
                                   shadow-sm flex items-center justify-center text-gray-500 hover:text-[#709028]"
                      >
                        <Smile size={12} />
                      </button>
                      {reactionFor === msgKey && (
                        <div className={`absolute bottom-full mb-1 ${isOwn ? 'end-0' : 'start-0'}
                                        flex gap-0.5 px-1.5 py-1 rounded-full bg-white dark:bg-gray-800
                                        border border-gray-200 dark:border-gray-600 shadow-lg z-10`}>
                          {QUICK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              disabled={reacting}
                              onClick={() => handleReact(msg.id, emoji)}
                              className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60
                      bg-white dark:bg-gray-900 relative">
        {replyTo && (
          <div className="mb-2 flex items-start gap-2 px-3 py-2 rounded-xl
                          bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <Reply size={14} className="shrink-0 mt-0.5 text-[#709028]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#709028] truncate">
                {isAr ? 'الرد على' : 'Replying to'} {replyTo.sender.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {replyTo.body?.trim()
                  || replyTo.attachments?.[0]?.name
                  || replyTo.attachments?.[0]?.fileName
                  || (isAr ? 'مرفق' : 'Attachment')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
            onClick={() => fileRef.current?.click()}
            disabled={sending}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors
                       disabled:opacity-50"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            className="hidden"
            onChange={handleFile}
          />
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
