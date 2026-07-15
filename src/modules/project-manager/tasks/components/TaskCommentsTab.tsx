import { useState } from 'react';
import { Bold, Italic, AtSign, Link, Pencil, Reply, X } from 'lucide-react';
import { Avatar }              from '@/shared/components/ui/Avatar';
import { useAutoResizeTextarea } from '@/shared/hooks/useAutoResizeTextarea';
import { useMentionComposer } from '@/shared/hooks/useMentionComposer';
import { MentionPopover }      from '@/shared/components/chat';
import { ensureHttpUrl }       from '@/shared/utils/format.utils';
import { messageWasEdited as isEdited } from '@/shared/utils/mentionComposer.utils';
import { formatNotificationDateTime } from '@/shared/utils/date.utils';
import type { MentionablePerson } from '@/shared/utils/mentionComposer.utils';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import type { TaskComment }    from '../types/taskModal.types';

interface Props {
  comments:  TaskComment[];
  text:      string;
  setText:   (v: string) => void;
  onSubmit:  (parentId?: string, mentions?: MentionRef[]) => void;
  onEdit?:   (id: string, body: string, mentions?: MentionRef[]) => void;
  mentionables?: MentionablePerson[];
  isAr:      boolean;
  getMentionInfo?:     (ref: MentionRef) => ResolvedMention | undefined;
  onMentionStartChat?: (ref: MentionRef) => void;
}

const URL_PATTERN = 'https?:\\/\\/[^\\s<]+|www\\.[^\\s<]+';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderFormatted(
  raw: string,
  mentions: MentionRef[] | undefined,
  getMentionInfo: ((ref: MentionRef) => ResolvedMention | undefined) | undefined,
  onMentionStartChat: ((ref: MentionRef) => void) | undefined,
  isAr: boolean,
): React.ReactNode[] {
  const mentionEntries = (mentions ?? [])
    .map(ref => ({ ref, info: getMentionInfo?.(ref) }))
    .filter((e): e is { ref: MentionRef; info: ResolvedMention } => !!e.info?.name)
    .sort((a, b) => b.info.name.length - a.info.name.length);
  const mentionAlt = mentionEntries.length
    ? mentionEntries.map(e => escapeRegExp(e.info.name)).join('|')
    : null;
  const mentionPattern = mentionAlt ? `@(?:${mentionAlt})` : '@\\S+';

  const regex = new RegExp(
    `(\\*\\*[^*]+\\*\\*|\\*[^*]+\\*|\\[[^\\]]+\\]\\([^)]+\\)|${URL_PATTERN}|${mentionPattern})`,
    'g',
  );
  const parts: React.ReactNode[] = [];
  let last = 0, key = 0, m: RegExpExecArray | null;

  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{raw.slice(last, m.index)}</span>);
    const t = m[0];
    if (t.startsWith('**')) {
      parts.push(<strong key={key++} className="font-bold">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('@')) {
      const entry = mentionEntries.find(e => e.info.name === t.slice(1));
      if (entry) {
        parts.push(
          <MentionPopover
            key={key++}
            refData={entry.ref}
            label={t}
            info={entry.info}
            isAr={isAr}
            onStartChat={onMentionStartChat}
            className="font-semibold text-[#709028] dark:text-[#A0CD39] underline decoration-dotted hover:opacity-80"
          />,
        );
      } else {
        parts.push(<span key={key++} className="text-[#709028] dark:text-[#A0CD39] font-semibold">{t}</span>);
      }
    } else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t);
      if (lm) parts.push(
        <a key={key++} href={lm[2]} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 hover:underline">{lm[1]}</a>
      );
    } else if (t.startsWith('*')) {
      parts.push(<em key={key++} className="italic">{t.slice(1, -1)}</em>);
    } else {
      const cleaned = t.replace(/[.,);!?]+$/, '');
      const suffix = t.slice(cleaned.length);
      parts.push(
        <a key={key++} href={ensureHttpUrl(cleaned)} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 hover:underline break-all">{cleaned}</a>,
      );
      if (suffix) parts.push(suffix);
    }
    last = m.index + t.length;
  }
  if (last < raw.length) parts.push(<span key={key++}>{raw.slice(last)}</span>);
  return parts;
}

function CommentItem({
  comment,
  isAr,
  getMentionInfo,
  onMentionStartChat,
  onReply,
  onEdit,
  nested = false,
}: {
  comment: TaskComment;
  isAr: boolean;
  getMentionInfo?: (ref: MentionRef) => ResolvedMention | undefined;
  onMentionStartChat?: (ref: MentionRef) => void;
  onReply?: (c: TaskComment) => void;
  onEdit?: (c: TaskComment) => void;
  nested?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${nested ? 'ps-4 border-s-2 border-[#A0CD39]/40' : ''}`}>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatNotificationDateTime(comment.dateLabel, isAr)}
            {isEdited(comment) && (
              <span className="ms-1 opacity-70">{isAr ? '· تم التعديل' : '· edited'}</span>
            )}
          </span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{comment.author}</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-relaxed">
            {renderFormatted(comment.text, comment.mentions, getMentionInfo, onMentionStartChat, isAr)}
          </p>
        </div>
        {!nested && (onReply || onEdit) && (
          <div className="flex justify-end gap-3">
            {onReply && (
              <button type="button" onClick={() => onReply(comment)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#709028] transition-colors">
                <Reply size={12} />
                {isAr ? 'رد' : 'Reply'}
              </button>
            )}
            {comment.isMine && onEdit && (
              <button type="button" onClick={() => onEdit(comment)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#709028] transition-colors">
                <Pencil size={12} />
                {isAr ? 'تعديل' : 'Edit'}
              </button>
            )}
          </div>
        )}
        {(comment.replies?.length ?? 0) > 0 && (
          <div className="space-y-3 pt-1">
            {comment.replies!.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isAr={isAr}
                getMentionInfo={getMentionInfo}
                onMentionStartChat={onMentionStartChat}
                onEdit={reply.isMine ? onEdit : undefined}
                nested
              />
            ))}
          </div>
        )}
      </div>
      <Avatar initial={comment.authorInitial} color={comment.authorColor} size="sm" />
    </div>
  );
}

export function TaskCommentsTab({
  comments, text, setText, onSubmit, onEdit, mentionables = [], isAr, getMentionInfo, onMentionStartChat,
}: Props) {
  const areaRef = useAutoResizeTextarea(text);
  const mentionComposer = useMentionComposer();
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null);
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null);

  function wrap(before: string, after: string) {
    const el = areaRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = text.slice(s, e) || (before === '**' ? (isAr ? 'نص عريض' : 'bold text') : before === '*' ? (isAr ? 'نص مائل' : 'italic') : 'text');
    const next = text.slice(0, s) + before + sel + after + text.slice(e);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  function startEdit(comment: TaskComment) {
    setReplyTo(null);
    setEditingComment(comment);
    setText(comment.text);
    const refs = (comment.mentions ?? [])
      .map(m => mentionables.find(x => x.id === m.id && x.type === m.type))
      .filter((m): m is MentionablePerson => !!m);
    mentionComposer.seedMentions(refs);
    requestAnimationFrame(() => areaRef.current?.focus());
  }

  function clearComposer() {
    setText('');
    setReplyTo(null);
    setEditingComment(null);
    mentionComposer.resetMentions();
  }

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mentions = mentionComposer.activeMentions(trimmed);

    if (editingComment && onEdit) {
      onEdit(editingComment.id, trimmed, mentions.length ? mentions : undefined);
      clearComposer();
      return;
    }

    onSubmit(replyTo?.id, mentions.length ? mentions : undefined);
    clearComposer();
  }

  const TOOLS = [
    { icon: <Bold size={14} />,   label: 'Bold',    title: 'عريض',  action: () => wrap('**', '**')        },
    { icon: <Italic size={14} />, label: 'Italic',  title: 'مائل',  action: () => wrap('*', '*')          },
    { icon: <Link size={14} />,   label: 'Link',    title: 'رابط',  action: () => wrap('[', '](https://)') },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Comment list */}
      <div className="space-y-5 flex-1">
        {comments.map(c => (
          <CommentItem
            key={c.id}
            comment={c}
            isAr={isAr}
            getMentionInfo={getMentionInfo}
            onMentionStartChat={onMentionStartChat}
            onReply={setReplyTo}
            onEdit={startEdit}
          />
        ))}
      </div>

      {/* Composer */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-2xl overflow-visible">
        {editingComment && (
          <div className="flex items-start gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-amber-50 dark:bg-amber-950/30">
            <Pencil size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate">
                {isAr ? 'تعديل التعليق' : 'Editing comment'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{editingComment.text}</p>
            </div>
            <button type="button" onClick={() => clearComposer()} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}

        {replyTo && !editingComment && (
          <div className="flex items-start gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-800/60">
            <Reply size={14} className="shrink-0 mt-0.5 text-[#709028]" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] font-semibold text-[#709028] truncate">
                {isAr ? 'الرد على' : 'Replying to'} {replyTo.author}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{replyTo.text}</p>
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

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          {TOOLS.map(btn => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={btn.action}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] hover:bg-[#D8EBAE]/40 dark:hover:bg-[#A0CD39]/10 transition-colors"
            >
              {btn.icon}
            </button>
          ))}
          <div className="relative">
            <button type="button" title={isAr ? 'إشارة' : 'Mention'}
              onClick={() => mentionComposer.setShowMentions(o => !o)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] hover:bg-[#D8EBAE]/40 dark:hover:bg-[#A0CD39]/10 transition-colors">
              <AtSign size={14} />
            </button>
            {mentionComposer.showMentions && (
              <div className="absolute bottom-full mb-1 end-0 w-52 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl z-50 py-1">
                {mentionables.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400 text-center">{isAr ? 'لا يوجد أعضاء' : 'No members'}</p>
                ) : mentionables.map(m => (
                  <button key={`${m.type}:${m.id}`} type="button"
                    onClick={() => setText(mentionComposer.insertMention(m)(text))}
                    className="w-full px-3 py-2 text-sm text-end text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 truncate">
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input + Send */}
        <div className="flex items-end gap-2 p-3">
          <button type="button" onClick={handleSubmit}
            className="w-9 h-9 rounded-full bg-[#A0CD39] hover:bg-[#709028] flex items-center justify-center shrink-0 transition-colors shadow-sm">
            <Reply size={15} className="text-white rotate-180" />
          </button>
          <textarea
            ref={areaRef}
            rows={1}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder={
              editingComment
                ? (isAr ? 'عدّل التعليق...' : 'Edit comment...')
                : replyTo
                  ? (isAr ? 'اكتب رداً...' : 'Write a reply...')
                  : (isAr ? 'أضف تعليقاً...' : 'Add a comment...')
            }
            className="flex-1 resize-none text-sm bg-transparent text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none text-right max-h-28 overflow-y-auto"
          />
        </div>
      </div>
    </div>
  );
}
