import { useRef, useState } from 'react';
import { FileText, Download, Paperclip } from 'lucide-react';

interface Props {
  isLoading: boolean;
  isAr:      boolean;
}

interface AttachmentItem {
  id:   string;
  name: string;
  size: string;
  type: string;
  file?: File;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileType(name: string): string {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE';
}

function triggerDownload(item: AttachmentItem) {
  const blob = item.file
    ? item.file
    : new Blob([`File: ${item.name}\nMock download.`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = item.name;
  a.click();
  URL.revokeObjectURL(url);
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600" />
      {[1, 2].map(i => (
        <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded" />
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="space-y-1 text-end">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskDetailAttachments({ isLoading, isAr }: Props) {
  const inputRef                = useRef<HTMLInputElement>(null);
  const [items, setItems]       = useState<AttachmentItem[]>([]);
  const [isDragging, setDrag]   = useState(false);

  if (isLoading) return <Skeleton />;

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: AttachmentItem[] = Array.from(files).map(f => ({
      id:   `${Date.now()}-${f.name}`,
      name: f.name,
      size: fmtSize(f.size),
      type: fileType(f.name),
      file: f,
    }));
    setItems(prev => [...prev, ...newItems]);
  }

  return (
    <div className="space-y-3">
      {/* Drag-drop upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={[
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20'
            : 'border-gray-200 dark:border-gray-600 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:border-brand-500 dark:hover:bg-brand-900/10',
        ].join(' ')}
      >
        <Paperclip size={22} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {isAr ? 'اسحب الملفات هنا أو انقر للتصفح' : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {isAr ? 'صور، PDF، مستندات، ZIP' : 'Images, PDF, Documents, ZIP'}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <button
            onClick={() => triggerDownload(item)}
            className="text-brand-500 hover:text-brand-600 transition-colors shrink-0"
            title={isAr ? 'تنزيل' : 'Download'}
          >
            <Download size={16} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 text-end">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.size} · {item.type}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-brand-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
