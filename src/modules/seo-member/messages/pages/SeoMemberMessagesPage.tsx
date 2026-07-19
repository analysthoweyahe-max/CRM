import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AtSign,
  Mic,
  MessageSquare,
  Menu,
  Paperclip,
  Pencil,
  Reply,
  Send,
  Smile,
  Square,
  Users,
  X,
} from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ChatAttachments, MessageBodyText, VoiceMessagePlayer } from '@/shared/components/chat';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import { setOpenConversation } from '@/shared/realtime-messages';
import { extractApiError } from '@/shared/utils/error.utils';
import { messageSnippet } from '@/shared/utils/messagePreview.utils';
import { messageWasEdited } from '@/shared/utils/mentionComposer.utils';
import { useAutoResizeTextarea } from '@/shared/hooks/useAutoResizeTextarea';
import { useVoiceRecorder } from '@/shared/hooks/useVoiceRecorder';
import { getPastedImageFile } from '@/shared/utils/clipboardImage.utils';
import { toast } from 'sonner';
import { CreateSeoGroupModal } from '../components/CreateSeoGroupModal';
import { NewSeoConversationModal } from '../components/NewSeoConversationModal';
import { SeoConversationList } from '../components/SeoConversationList';
import { SeoGroupMembersPanel } from '../components/SeoGroupMembersPanel';
import {
  useSeoConversations,
  useSeoConversation,
  useSeoMessages,
  useSendSeoMessage,
  useEditSeoMessage,
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

function messageDuration(msg: SeoMessage): number | undefined {
  const d = msg.durationSeconds ?? msg.duration_seconds;
  return d != null ? Number(d) : undefined;
}

function formatRecordingTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ChatProps {
  conversation: SeoConversation;
  isAr:         boolean;
  onConversationUpdate: (conv: SeoConversation) => void;
  onLeftGroup: () => void;
  onOpenSidebar?: () => void;
  onMentionStartChat: (ref: MentionRef) => void;
}

function SeoMemberChatWindow({ conversation, isAr, onConversationUpdate, onLeftGroup, onOpenSidebar, onMentionStartChat }: ChatProps) {
  const { user }  = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const messageElRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  /** Backend sender.id is the actor UUID — match AuthUser.id, not employeeNumber. */
  const currentUserId = user?.id ?? '';

  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionRefs, setMentionRefs] = useState<SeoMentionable[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [replyTo, setReplyTo] = useState<SeoMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<SeoMessage | null>(null);
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const textareaRef = useAutoResizeTextarea(text);
  const voice = useVoiceRecorder();

  const isGroup = conversation.type === 'group';

  const { data: detail } = useSeoConversation(conversation.id, isGroup && showMembers);
  const liveConversation = detail ?? conversation;

  const { data: messages = [], isLoading } = useSeoMessages(conversation.id);
  const { mutate: sendMessage, isPending: sending } = useSendSeoMessage(conversation.id);
  const { mutate: editMessage, isPending: editing } = useEditSeoMessage(conversation.id, isAr);
  const { mutate: reactToMessage, isPending: reacting } = useReactSeoMessage(conversation.id);
  const { mutate: markRead } = useMarkSeoRead();
  const { data: mentionables = [] } = useSeoMentionables(showMentions);
  /** Unfiltered, always-on fetch used to resolve names/avatars of @mentions already in message history. */
  const { data: allMentionables = [] } = useSeoMentionables(true, undefined, { excludeSelf: false });

  function getMentionInfo(ref: MentionRef): ResolvedMention | undefined {
    const m = allMentionables.find(x => x.id === ref.id && x.type === ref.type);
    if (!m) return undefined;
    return {
      id: m.id, type: m.type, name: m.name,
      avatarUrl: m.avatarUrl, avatarInitial: m.avatarInitial,
      roleLabel: m.role,
    };
  }

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
    setMentionRefs([]);
    setReplyTo(null);
    setEditingMessage(null);
    setReactionFor(null);
    setHighlightId(null);
    voice.cancel();
  }, [conversation.id]);

  useEffect(() => {
    if (voice.error) toast.error(voice.error);
  }, [voice.error]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-reaction-menu]')) setReactionFor(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function activeMentions(body: string) {
    return mentionRefs
      .filter(m => body.includes(`@${m.name}`))
      .map(m => ({ type: m.type, id: m.id }));
  }

  function scrollToMessage(id: number | string) {
    const key = String(id);
    const el = messageElRefs.current.get(key);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(key);
    window.setTimeout(() => {
      setHighlightId(prev => (prev === key ? null : prev));
    }, 1600);
  }

  function clearComposer() {
    setText('');
    setMentionRefs([]);
    setReplyTo(null);
    setEditingMessage(null);
    setShowMentions(false);
  }

  function canEditMessage(msg: SeoMessage, isOwn: boolean) {
    // Text-only: API returns 422 for voice / non-text. Hide edit when no editable body.
    const type = msg.type ?? 'text';
    return isOwn && type === 'text' && !!msg.body?.trim();
  }

  function startEdit(msg: SeoMessage) {
    setReplyTo(null);
    setEditingMessage(msg);
    setText(msg.body ?? '');
    const refs = (msg.mentions ?? [])
      .map(m => allMentionables.find(x => x.id === m.id && x.type === m.type))
      .filter((m): m is SeoMentionable => !!m);
    setMentionRefs(refs);
    setShowMentions(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleSend() {
    const body = text.trim();
    if (!body || sending || editing || voice.isRecording) return;
    const mentions = activeMentions(body);

    if (editingMessage) {
      editMessage(
        {
          messageId: editingMessage.id,
          payload: { body, ...(mentions.length ? { mentions } : {}) },
        },
        { onSuccess: () => clearComposer() },
      );
      return;
    }

    const parentId = replyTo?.id;
    clearComposer();
    sendMessage({
      body,
      ...(parentId != null ? { reply_to: parentId } : {}),
      ...(mentions.length ? { mentions } : {}),
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function insertMention(m: SeoMentionable) {
    setText(prev => (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${m.name} `);
    setMentionRefs(prev => (prev.some(r => r.id === m.id && r.type === m.type) ? prev : [...prev, m]));
    setShowMentions(false);
  }

  function sendFile(file: File, opts?: { durationSeconds?: number }) {
    if (sending) return;
    const body = text.trim();
    const mentions = body ? activeMentions(body) : [];
    sendMessage({
      body: body || undefined,
      file,
      ...(opts?.durationSeconds != null ? { duration_seconds: opts.durationSeconds } : {}),
      ...(replyTo?.id != null ? { reply_to: replyTo.id } : {}),
      ...(mentions.length ? { mentions } : {}),
    });
    setText('');
    setMentionRefs([]);
    setReplyTo(null);
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    sendFile(file);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = getPastedImageFile(e);
    if (!file) return;
    e.preventDefault();
    sendFile(file);
  }

  async function handleMicClick() {
    if (sending) return;
    if (!voice.isRecording) {
      const ok = await voice.start();
      if (!ok) {
        toast.error(isAr ? 'تعذر بدء التسجيل' : 'Could not start recording');
      }
      return;
    }
    const result = await voice.stop();
    if (!result) return;
    sendFile(result.file, { durationSeconds: result.durationSeconds });
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
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0',
              showMembers
                ? 'bg-[#D8EBAE] text-[#709028]'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            <Users size={14} />
            <span className="hidden sm:inline">{isAr ? 'الأعضاء' : 'Members'}</span>
          </button>
        )}
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-lg text-gray-400 shrink-0
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
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
            const isVoice = msg.type === 'voice';
            const isHighlighted = highlightId === msgKey;

            return (
              <div
                key={msg.id}
                ref={(el) => {
                  if (el) messageElRefs.current.set(msgKey, el);
                  else messageElRefs.current.delete(msgKey);
                }}
                className={`group flex ${isOwn ? 'justify-start' : 'justify-end'}`}
              >
                <div className="relative max-w-[70%]">
                  <div className={[
                    'rounded-2xl px-4 py-2.5 shadow-sm transition-shadow duration-300',
                    isOwn
                      ? 'bg-[#A0CD39] text-gray-900 rounded-ss-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-se-sm',
                    isHighlighted ? 'ring-2 ring-[#709028] shadow-md' : '',
                  ].join(' ')}>
                    {!isOwn && isGroup && (
                      <p className="text-[11px] font-semibold text-[#709028] dark:text-[#A0CD39] mb-0.5">
                        {msg.sender.name}
                      </p>
                    )}

                    {quoted && (
                      <button
                        type="button"
                        onClick={() => scrollToMessage(quoted.id)}
                        className={`mb-2 w-full text-start px-2.5 py-1.5 rounded-lg border-s-2 text-[11px] leading-snug
                                    ${isOwn
                                      ? 'bg-white/25 border-gray-700/40'
                                      : 'bg-gray-50 dark:bg-gray-700/60 border-[#A0CD39]'}`}
                      >
                        <p className="font-semibold opacity-80 truncate">
                          {quoted.sender?.name ?? (isAr ? 'رسالة' : 'Message')}
                        </p>
                        <p className="opacity-70 line-clamp-2 whitespace-pre-wrap">
                          {messageSnippet(quoted, isAr)}
                        </p>
                      </button>
                    )}

                    {isVoice ? (
                      <VoiceMessagePlayer
                        url={msg.attachments?.[0]?.url}
                        durationSeconds={messageDuration(msg)}
                        isOwn={isOwn}
                        isAr={isAr}
                      />
                    ) : (
                      <ChatAttachments attachments={msg.attachments ?? []} isOwn={isOwn} />
                    )}

                    {msg.body && (
                      <MessageBodyText
                        text={msg.body}
                        linkClassName={isOwn
                          ? 'underline break-all text-gray-900 hover:opacity-80'
                          : 'underline break-all text-[#709028] dark:text-[#A0CD39] hover:opacity-80'}
                        mentions={msg.mentions}
                        getMentionInfo={getMentionInfo}
                        onMentionStartChat={onMentionStartChat}
                        isAr={isAr}
                        mentionClassName={isOwn
                          ? 'font-semibold text-gray-900 underline decoration-dotted hover:opacity-80'
                          : 'font-semibold text-[#709028] dark:text-[#A0CD39] underline decoration-dotted hover:opacity-80'}
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
                      {messageWasEdited(msg) && (
                        <span className="ms-1 opacity-70">{isAr ? '· تم التعديل' : '· edited'}</span>
                      )}
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
                    {canEditMessage(msg, isOwn) && (
                      <button
                        type="button"
                        title={isAr ? 'تعديل' : 'Edit'}
                        onClick={() => startEdit(msg)}
                        className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600
                                   shadow-sm flex items-center justify-center text-gray-500 hover:text-[#709028]"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
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
        {editingMessage && (
          <div className="mb-2 flex items-start gap-2 px-3 py-2 rounded-xl
                          bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
            <Pencil size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate">
                {isAr ? 'تعديل الرسالة' : 'Editing message'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {editingMessage.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearComposer()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {replyTo && (
          <div className="mb-2 flex items-start gap-2 px-3 py-2 rounded-xl
                          bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <Reply size={14} className="shrink-0 mt-0.5 text-[#709028]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#709028] truncate">
                {isAr ? 'الرد على' : 'Replying to'} {replyTo.sender.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {messageSnippet(replyTo, isAr)}
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

        {voice.isRecording && (
          <div className="mb-2 flex items-center gap-3 px-3 py-2 rounded-xl
                          bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <p className="text-xs font-medium text-red-600 dark:text-red-400 tabular-nums flex-1">
              {isAr ? 'جاري التسجيل' : 'Recording'} · {formatRecordingTime(voice.elapsedSeconds)}
            </p>
            <button
              type="button"
              onClick={() => voice.cancel()}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending || editing || voice.isRecording}
            className="w-10 h-10 rounded-full bg-[#A0CD39] hover:bg-[#709028]
                       flex items-center justify-center transition-colors shrink-0
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending || editing ? (
              <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} className="text-gray-900" style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            rows={1}
            disabled={voice.isRecording}
            placeholder={voice.isRecording
              ? (isAr ? 'جاري التسجيل...' : 'Recording...')
              : editingMessage
                ? (isAr ? 'عدّل الرسالة...' : 'Edit message...')
                : (isAr ? 'اكتب رسالة...' : 'Type a message...')}
            className="flex-1 resize-none py-2.5 px-3 text-sm rounded-xl
                       bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40
                       max-h-28 overflow-y-auto disabled:opacity-60"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMentions(o => !o)}
              disabled={voice.isRecording}
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors
                         disabled:opacity-40"
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
                    onClick={() => insertMention(m)}
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
            onClick={() => { void handleMicClick(); }}
            disabled={sending}
            title={voice.isRecording
              ? (isAr ? 'إيقاف وإرسال' : 'Stop & send')
              : (isAr ? 'رسالة صوتية' : 'Voice message')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        disabled:opacity-50
                        ${voice.isRecording
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40'}`}
          >
            {voice.isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={16} />}
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={sending || voice.isRecording}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 transition-colors
                       disabled:opacity-50"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,audio/*"
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
  const { lang, isRTL } = useLang();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hiddenTranslate = isRTL ? '-translate-x-full' : 'translate-x-full';

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

  async function startChatWith(recipientType: string, recipientId: string) {
    if (creatingChat) return;
    try {
      const conv = await createConversation({
        recipient_type: recipientType,
        recipient_id: recipientId,
      });
      setActiveConv(conv);
      setShowNewChat(false);
      setTypeFilter('all');
    } catch {
      /* toast in hook */
    }
  }

  function handleStartChat(person: SeoMentionable) {
    return startChatWith(person.type, person.id);
  }

  function handleMentionStartChat(ref: MentionRef) {
    return startChatWith(ref.type, ref.id);
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative -m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                 bg-white dark:bg-gray-900 rounded-none"
    >
      <div className="flex-1 min-w-0 flex flex-col">
        {activeConv ? (
          <SeoMemberChatWindow
            conversation={activeConv}
            isAr={isAr}
            onConversationUpdate={setActiveConv}
            onLeftGroup={() => setActiveConv(null)}
            onOpenSidebar={() => setSidebarOpen(true)}
            onMentionStartChat={handleMentionStartChat}
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
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mt-1 px-4 py-2 rounded-lg bg-[#A0CD39]
                         text-white text-sm font-medium hover:bg-[#709028] transition-colors"
            >
              {isAr ? 'عرض المحادثات' : 'View Conversations'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        absolute inset-y-0 inset-e-0 z-50 flex w-72 flex-col
        bg-white dark:bg-gray-900
        shadow-2xl
        transition-transform duration-300 ease-in-out
        md:relative md:inset-auto md:z-auto md:w-80 md:shadow-none md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : hiddenTranslate}
      `}>
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
          onSelect={conv => { setActiveConv(conv); setSidebarOpen(false); }}
          onNewChat={() => setShowNewChat(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          canCreateGroup={canCreateGroup}
          onClose={() => setSidebarOpen(false)}
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
