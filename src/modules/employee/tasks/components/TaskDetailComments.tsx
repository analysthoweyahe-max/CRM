import { useRef, useState } from 'react';
import { Bold, Italic, AtSign, Paperclip, Send } from 'lucide-react';
import { useCreateComment } from '../hooks/useTaskDetail';
import type { TaskComment } from '../types/taskDetail.types';

interface Props {
  comments:   TaskComment[];
  isLoading:  boolean;
  isAr:       boolean;
  // When provided, sending persists for real via /v1/pm/.../comments.
  projectId?: string;
  taskId?:    string;
  // Alternative persistence path for callers with their own comment API
  // (e.g. SEO task detail) — takes priority over projectId/taskId when set.
  onSend?:    (body: string) => Promise<unknown>;
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

export function TaskDetailComments({ comments: serverComments, isLoading, isAr, projectId, taskId, onSend }: Props) {
  const canPersist = !!onSend || !!(projectId && taskId);
  const createCommentMutation = useCreateComment(projectId ?? '', taskId ?? '');

  const [localComments, setLocalComments] = useState<TaskComment[]>(serverComments);
  const comments = canPersist ? serverComments : localComments;
  const [text, setText]         = useState('');
  const textareaRef             = useRef<HTMLTextAreaElement>(null);
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const selRef                  = useRef({ start: 0, end: 0 });

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

  function insertAt(char: string) {
    const { start } = selRef.current;
    const next = text.slice(0, start) + char + text.slice(start);
    setText(next);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(start + char.length, start + char.length);
    });
  }

  function sendComment() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (onSend) {
      onSend(trimmed).then(() => {
        setText('');
        selRef.current = { start: 0, end: 0 };
        textareaRef.current?.focus();
      });
      return;
    }

    if (canPersist) {
      createCommentMutation.mutate(trimmed, {
        onSuccess: () => {
          setText('');
          selRef.current = { start: 0, end: 0 };
          textareaRef.current?.focus();
        },
      });
      return;
    }

    const timeStr = new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const newComment: TaskComment = {
      id:        Date.now().toString(),
      authorAr:  'أنت',
      authorEn:  'You',
      initials:  'أ',
      avatarBg:  'bg-brand-500',
      body:      trimmed,
      createdAt: timeStr,
      isMine:    true,
    };
    setLocalComments(prev => [...prev, newComment]);
    setText('');
    selRef.current = { start: 0, end: 0 };
    textareaRef.current?.focus();
  }

  return (
    <div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 py-4">
            <div className={`w-9 h-9 rounded-full ${c.avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-gray-400">{c.createdAt}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {isAr ? c.authorAr : c.authorEn}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.body}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <button className="hover:text-gray-600 transition-colors">{isAr ? 'رد' : 'Reply'}</button>
                {c.isMine && (
                  <>
                    <button className="hover:text-gray-600 transition-colors">{isAr ? 'تعديل' : 'Edit'}</button>
                    <button className="hover:text-red-500 transition-colors">{isAr ? 'حذف' : 'Delete'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700">
          <button
            type="button"
            title="Bold"
            onClick={() => applyFormat('**', '**')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => applyFormat('*', '*')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            title="Mention"
            onClick={() => insertAt('@')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <AtSign size={13} />
          </button>
          <button
            type="button"
            title="Attach"
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Paperclip size={13} />
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" />
        </div>

        {/* Input row */}
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
                sendComment();
              }
            }}
            rows={2}
            placeholder={isAr ? 'أضف تعليقاً...' : 'Add a comment...'}
            className="flex-1 resize-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 bg-transparent leading-relaxed"
          />
          <button
            onClick={sendComment}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
