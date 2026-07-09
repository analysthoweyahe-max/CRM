import { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import {
  formatFileSize,
  SEO_ATTACHMENT_CREATE_MAX_MB,
  validateSeoFileSizes,
} from '@/shared/utils/seoTaskAttachment.utils';

interface Props {
  files:     File[];
  onChange:  (files: File[]) => void;
  isAr:      boolean;
  error?:    string | null;
  onError?:  (msg: string | null) => void;
}

export function SeoTaskFilesInput({ files, onChange, isAr, error, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files, ...Array.from(list)];
    const validation = validateSeoFileSizes(next, SEO_ATTACHMENT_CREATE_MAX_MB);
    if (validation) {
      onError?.(validation);
      return;
    }
    onError?.(null);
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                   border border-dashed border-gray-200 dark:border-gray-600
                   text-sm text-gray-600 dark:text-gray-300
                   hover:border-[#A0CD39]/60 hover:bg-[#D8EBAE]/10 transition-colors"
      >
        <Paperclip size={16} />
        {isAr ? 'إضافة مرفقات (اختياري)' : 'Add attachments (optional)'}
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {isAr
          ? `الحد الأقصى ${SEO_ATTACHMENT_CREATE_MAX_MB} م.ب لكل ملف`
          : `Max ${SEO_ATTACHMENT_CREATE_MAX_MB} MB per file`}
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
            >
              <span className="flex-1 truncate text-gray-700 dark:text-gray-200">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatFileSize(file.size, isAr)}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="p-1 rounded text-gray-400 hover:text-red-500"
                aria-label={isAr ? 'إزالة' : 'Remove'}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
