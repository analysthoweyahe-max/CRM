import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link2, List, ListOrdered, Unlink } from 'lucide-react';

interface RichTextEditorProps {
  value:        string;
  onChange:     (html: string) => void;
  placeholder?: string;
  dir?:         'rtl' | 'ltr';
  hasError?:    boolean;
  className?:   string;
}

export function RichTextEditor({ value, onChange, placeholder, dir, hasError, className }: RichTextEditorProps) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    // Defer creation until after mount so React StrictMode remounts don't
    // call into a destroyed editor whose schema was already nulled (→ null.cached).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, code: false, codeBlock: false, horizontalRule: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank', class: 'underline' },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: [
          'max-w-none focus:outline-none min-h-[80px] px-4 py-3 text-sm',
          'text-gray-800 dark:text-gray-200',
          '[&_p]:m-0 [&_strong]:font-bold [&_em]:italic',
          '[&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5',
          '[&_a]:text-[#709028] dark:[&_a]:text-[#A0CD39] [&_a]:underline [&_a]:cursor-pointer',
          '[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
          '[&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:float-left',
        ].join(' '),
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return;
      const html = ed.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value !== editor.getHTML() && !(value === '' && editor.isEmpty)) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    if (!linkPopoverOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setLinkPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [linkPopoverOpen]);

  if (!editor || editor.isDestroyed) return null;

  function openLinkPopover() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes('link').href ?? '');
    setLinkPopoverOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkPopoverOpen(false);
  }

  function removeLink() {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkPopoverOpen(false);
  }

  return (
    <div
      dir={dir}
      className={[
        'rounded-lg border bg-white dark:bg-gray-700/50 transition',
        hasError
          ? 'border-red-400 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-400/20'
          : 'border-gray-200 dark:border-gray-600 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20',
        className ?? '',
      ].join(' ')}
    >
      <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-600 px-2 py-1.5">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolbarButton>
        <span className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <div className="relative">
          <ToolbarButton active={editor.isActive('link')} onClick={openLinkPopover}>
            <Link2 size={14} />
          </ToolbarButton>
          {linkPopoverOpen && (
            <div
              ref={popoverRef}
              dir="ltr"
              className="absolute top-full start-0 mt-1.5 z-20 w-64 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-800 shadow-xl p-2.5 space-y-2"
            >
              <input
                autoFocus
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                  if (e.key === 'Escape') { e.preventDefault(); setLinkPopoverOpen(false); }
                }}
                placeholder="https://example.com"
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-gray-700/50 px-3 text-sm text-gray-800 dark:text-gray-200
                           outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20
                           transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <div className="flex items-center justify-end gap-1.5">
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                               text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Unlink size={12} />
                    {dir === 'rtl' ? 'إزالة' : 'Remove'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyLink}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#A0CD39] text-gray-900 hover:bg-[#709028] transition-colors"
                >
                  {dir === 'rtl' ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'p-1.5 rounded-md transition-colors',
        active
          ? 'bg-[#D8EBAE] text-[#709028] dark:bg-[#D8EBAE]/20 dark:text-[#A0CD39]'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600/50 dark:hover:text-gray-200',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
