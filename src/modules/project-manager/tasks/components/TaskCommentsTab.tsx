import { useRef }              from 'react';
import { Bold, Italic, AtSign, Link, Reply } from 'lucide-react';
import { Avatar }              from '@/shared/components/ui/Avatar';
import type { TaskComment }    from '../types/taskModal.types';

interface Props {
  comments:  TaskComment[];
  text:      string;
  setText:   (v: string) => void;
  onSubmit:  () => void;
  isAr:      boolean;
}

function renderFormatted(raw: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|@\S+|\[[^\]]+\]\([^)]+\))/g;
  const parts: React.ReactNode[] = [];
  let last = 0, key = 0, m: RegExpExecArray | null;

  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{raw.slice(last, m.index)}</span>);
    const t = m[0];
    if (t.startsWith('**')) {
      parts.push(<strong key={key++} className="font-bold">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('*')) {
      parts.push(<em key={key++} className="italic">{t.slice(1, -1)}</em>);
    } else if (t.startsWith('@')) {
      parts.push(<span key={key++} className="text-[#709028] dark:text-[#A0CD39] font-semibold">{t}</span>);
    } else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t);
      if (lm) parts.push(
        <a key={key++} href={lm[2]} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 hover:underline">{lm[1]}</a>
      );
    }
    last = m.index + t.length;
  }
  if (last < raw.length) parts.push(<span key={key++}>{raw.slice(last)}</span>);
  return parts;
}

export function TaskCommentsTab({ comments, text, setText, onSubmit, isAr }: Props) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

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

  function insert(str: string) {
    const el = areaRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    setText(text.slice(0, pos) + str + text.slice(pos));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos + str.length, pos + str.length);
    });
  }

  const TOOLS = [
    { icon: <Bold size={14} />,   label: 'Bold',    title: 'عريض',  action: () => wrap('**', '**')        },
    { icon: <Italic size={14} />, label: 'Italic',  title: 'مائل',  action: () => wrap('*', '*')          },
    { icon: <AtSign size={14} />, label: 'Mention', title: 'إشارة', action: () => insert('@')              },
    { icon: <Link size={14} />,   label: 'Link',    title: 'رابط',  action: () => wrap('[', '](https://)') },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Comment list */}
      <div className="space-y-5 flex-1">
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">{c.dateLabel}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{c.author}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-relaxed">
                  {renderFormatted(c.text)}
                </p>
              </div>
              <div className="flex justify-end">
                <button type="button"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#709028] transition-colors">
                  <Reply size={12} />
                  {isAr ? 'رد' : 'Reply'}
                </button>
              </div>
            </div>
            <Avatar initial={c.authorInitial} color={c.authorColor} size="sm" />
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden">
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
        </div>

        {/* Input + Send */}
        <div className="flex items-end gap-2 p-3">
          <button type="button" onClick={onSubmit}
            className="w-9 h-9 rounded-full bg-[#A0CD39] hover:bg-[#709028] flex items-center justify-center shrink-0 transition-colors shadow-sm">
            <Reply size={15} className="text-white rotate-180" />
          </button>
          <textarea
            ref={areaRef}
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            placeholder={isAr ? 'أضف تعليقاً...' : 'Add a comment...'}
            className="flex-1 resize-none text-sm bg-transparent text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none text-right"
          />
        </div>
      </div>
    </div>
  );
}
