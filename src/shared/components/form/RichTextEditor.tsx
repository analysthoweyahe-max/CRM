import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value:        string;
  onChange:     (html: string) => void;
  placeholder?: string;
  dir?:         'rtl' | 'ltr';
  hasError?:    boolean;
  className?:   string;
}

export function RichTextEditor({ value, onChange, placeholder, dir, hasError, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, code: false, codeBlock: false, horizontalRule: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: [
          'max-w-none focus:outline-none min-h-[80px] px-4 py-3 text-sm',
          'text-gray-800 dark:text-gray-200',
          '[&_p]:m-0 [&_strong]:font-bold [&_em]:italic',
          '[&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5',
          '[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
          '[&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:float-left',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === '' && editor.isEmpty)) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

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
