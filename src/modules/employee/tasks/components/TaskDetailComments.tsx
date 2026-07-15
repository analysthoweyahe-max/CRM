import { useRef, useState } from 'react';
import { Bold, Italic, AtSign, Paperclip, Pencil, Reply, Send, X } from 'lucide-react';
import { useCreateComment, useUpdateComment } from '../hooks/useTaskDetail';
import { useAutoResizeTextarea } from '@/shared/hooks/useAutoResizeTextarea';
import { useMentionComposer } from '@/shared/hooks/useMentionComposer';
import { MessageBodyText } from '@/shared/components/chat';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import type { MentionablePerson } from '@/shared/utils/mentionComposer.utils';
import { messageWasEdited as isEdited } from '@/shared/utils/mentionComposer.utils';
import { formatNotificationDateTime } from '@/shared/utils/date.utils';
import type { TaskComment, SendCommentPayload, EditCommentPayload } from '../types/taskDetail.types';

export type { SendCommentPayload, EditCommentPayload };

interface Props {
  comments:   TaskComment[];
  isLoading:  boolean;
  isAr:       boolean;
  projectId?: string;
  taskId?:    string;
  onSend?:    (payload: SendCommentPayload) => Promise<unknown>;
  onEdit?:    (payload: EditCommentPayload) => Promise<unknown>;
  mentionables?: MentionablePerson[];
  getMentionInfo?:      (ref: MentionRef) => ResolvedMention | undefined;
  onMentionStartChat?:  (ref: MentionRef) => void;
}

function Skeleton() {
  return (
    <div className="space-y-0 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-3 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentRow({
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
    <div className={`flex gap-3 py-4 ${nested ? 'border-s-2 border-[#A0CD39]/50 ps-3' : ''}`}>
      <div className={`w-9 h-9 rounded-full ${comment.avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
        {comment.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-gray-400">
            {formatNotificationDateTime(comment.createdAt, isAr)}
            {isEdited(comment) && (
              <span className="ms-1 opacity-70">{isAr ? '· تم التعديل' : '· edited'}</span>
            )}
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? comment.authorAr : comment.authorEn}
          </span>
        </div>
        <MessageBodyText
          text={comment.body}
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap wrap-break-word"
          mentions={comment.mentions}
          getMentionInfo={getMentionInfo}
          onMentionStartChat={onMentionStartChat}
          isAr={isAr}
        />
        {!nested && (onReply || onEdit) && (
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            {onReply && (
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                <Reply size={12} />
                {isAr ? 'رد' : 'Reply'}
              </button>
            )}
            {comment.isMine && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(comment)}
                className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                <Pencil size={12} />
                {isAr ? 'تعديل' : 'Edit'}
              </button>
            )}
          </div>
        )}
        {(comment.replies?.length ?? 0) > 0 && (
          <div className="mt-2 space-y-0 divide-y divide-gray-100 dark:divide-gray-700/60">
            {comment.replies!.map(reply => (
              <CommentRow
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
    </div>
  );
}

export function TaskDetailComments({
  comments: serverComments, isLoading, isAr, projectId, taskId, onSend, onEdit,
  mentionables = [], getMentionInfo, onMentionStartChat,
}: Props) {
  const canPersist = !!onSend || !!onEdit || !!(projectId && taskId);
  const createCommentMutation = useCreateComment(projectId ?? '', taskId ?? '');
  const updateCommentMutation = useUpdateComment(projectId ?? '', taskId ?? '');
  const mentionComposer = useMentionComposer();

  const [localComments, setLocalComments] = useState<TaskComment[]>(serverComments);
  const comments = canPersist ? serverComments : localComments;
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null);
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null);
  const textareaRef = useAutoResizeTextarea(text);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selRef = useRef({ start: 0, end: 0 });

  if (isLoading) return <Skeleton />;

  function saveSelection() {
    const ta = textareaRef.current;
    if (!ta) return;
    selRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  }

  function applyFormat(prefix: string, suffix: string) {
    const { start, end } = selRef.current;
    const sel   = text.slice(start, end);
    const inner = sel || (isAr ? 'نص' : 'text');
    const next  = text.slice(0, start) + prefix + inner + suffix + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const cursor = start + prefix.length + inner.length;
      ta.setSelectionRange(cursor, cursor);
    });
  }

  function clearComposer() {
    setText('');
    setReplyTo(null);
    setEditingComment(null);
    mentionComposer.resetMentions();
    selRef.current = { start: 0, end: 0 };
    textareaRef.current?.focus();
  }

  function startEdit(comment: TaskComment) {
    setReplyTo(null);
    setEditingComment(comment);
    setText(comment.body);
    const refs = (comment.mentions ?? [])
      .map(m => mentionables.find(x => x.id === m.id && x.type === m.type))
      .filter((m): m is MentionablePerson => !!m);
    mentionComposer.seedMentions(refs);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function submitComposer() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mentions = mentionComposer.activeMentions(trimmed);

    if (editingComment) {
      const payload: EditCommentPayload = {
        id: editingComment.id,
        body: trimmed,
        ...(mentions.length ? { mentions } : {}),
      };
      if (onEdit) {
        onEdit(payload).then(() => clearComposer());
        return;
      }
      if (projectId && taskId) {
        updateCommentMutation.mutate(payload, { onSuccess: () => clearComposer() });
        return;
      }
      setLocalComments(prev => updateLocalComment(prev, payload));
      clearComposer();
      return;
    }

    const payload: SendCommentPayload = {
      body: trimmed,
      parentId: replyTo?.id,
      ...(mentions.length ? { mentions } : {}),
    };

    if (onSend) {
      onSend(payload).then(() => clearComposer());
      return;
    }

    if (canPersist && projectId && taskId) {
      createCommentMutation.mutate(payload, { onSuccess: () => clearComposer() });
      return;
    }

    appendLocalComment(trimmed, replyTo?.id);
    clearComposer();
  }

  function appendLocalComment(body: string, parentId?: string) {
    const timeStr = new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const newComment: TaskComment = {
      id: Date.now().toString(),
      authorAr: 'أنت', authorEn: 'You', initials: 'أ', avatarBg: 'bg-brand-500',
      body, createdAt: timeStr, isMine: true, replies: [],
    };
    if (parentId) {
      setLocalComments(prev => prev.map(c =>
        c.id === parentId ? { ...c, replies: [...(c.replies ?? []), newComment] } : c,
      ));
    } else {
      setLocalComments(prev => [...prev, newComment]);
    }
  }

  function updateLocalComment(list: TaskComment[], payload: EditCommentPayload): TaskComment[] {
    const patch = (items: TaskComment[]): TaskComment[] =>
      items.map(c => {
        if (c.id === payload.id) {
          return { ...c, body: payload.body, mentions: payload.mentions, isEdited: true };
        }
        if (c.replies?.length) return { ...c, replies: patch(c.replies) };
        return c;
      });
    return patch(list);
  }

  return (
    <div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {comments.map(c => (
          <CommentRow
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

      <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-xl overflow-visible">
        {editingComment && (
          <div className="flex items-start gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-amber-50 dark:bg-amber-950/30">
            <Pencil size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate">
                {isAr ? 'تعديل التعليق' : 'Editing comment'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{editingComment.body}</p>
            </div>
            <button type="button" onClick={() => clearComposer()} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}

        {replyTo && !editingComment && (
          <div className="flex items-start gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
            <Reply size={14} className="shrink-0 mt-0.5 text-[#709028]" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#709028] truncate">
                {isAr ? 'الرد على' : 'Replying to'} {isAr ? replyTo.authorAr : replyTo.authorEn}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{replyTo.body}</p>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700">
          <button type="button" title="Bold" onClick={() => applyFormat('**', '**')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <Bold size={13} />
          </button>
          <button type="button" title="Italic" onClick={() => applyFormat('*', '*')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <Italic size={13} />
          </button>
          <div className="relative">
            <button type="button" title="Mention" onClick={() => mentionComposer.setShowMentions(o => !o)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <AtSign size={13} />
            </button>
            {mentionComposer.showMentions && (
              <div className="absolute bottom-full mb-1 start-0 w-52 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl z-50 py-1">
                {mentionables.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400 text-center">{isAr ? 'لا يوجد أعضاء' : 'No members'}</p>
                ) : mentionables.map(m => (
                  <button key={`${m.type}:${m.id}`} type="button"
                    onClick={() => setText((prev: string) => mentionComposer.insertMention(m)(prev))}
                    className="w-full px-3 py-2 text-sm text-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 truncate">
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" title="Attach" onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <Paperclip size={13} />
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" />
        </div>

        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onSelect={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submitComposer();
              }
            }}
            rows={1}
            placeholder={
              editingComment
                ? (isAr ? 'عدّل التعليق...' : 'Edit comment...')
                : replyTo
                  ? (isAr ? 'اكتب رداً...' : 'Write a reply...')
                  : (isAr ? 'أضف تعليقاً...' : 'Add a comment...')
            }
            className="flex-1 resize-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 bg-transparent leading-relaxed max-h-28 overflow-y-auto"
          />
          <button
            onClick={submitComposer}
            disabled={!text.trim() || createCommentMutation.isPending || updateCommentMutation.isPending}
            className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
