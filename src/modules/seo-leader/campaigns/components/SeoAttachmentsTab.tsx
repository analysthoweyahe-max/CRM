import { useRef, useState }                              from 'react';
import { Paperclip, Trash2, Download, FileImage, FileText, File, Loader2 } from 'lucide-react';
import { env }                       from '@/app/config/env';
import { TOKEN_KEY }                 from '@/app/config/constants';
import {
  formatFileSize,
  SEO_ATTACHMENT_UPLOAD_MAX_MB,
  validateSeoFileSizes,
  type SeoTaskAttachment,
} from '@/shared/utils/seoTaskAttachment.utils';

const API_ORIGIN = (() => {
  try { return new URL(env.apiBaseUrl).origin; } catch { return ''; }
})();

function buildUrl(url?: string) {
  if (!url) return '';
  try {
    const { pathname, search } = new URL(url);
    return `${API_ORIGIN}${pathname}${search}`;
  } catch {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}

async function downloadFile(url: string, filename: string) {
  try {
    const token =
      localStorage.getItem(TOKEN_KEY) ??
      sessionStorage.getItem(TOKEN_KEY) ?? '';
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function FileThumbnail({ mimeType }: { mimeType?: string }) {
  if (mimeType?.includes('image')) return (
    <div className="w-12 h-12 rounded-lg bg-[#D8EBAE]/70 dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
      <FileImage size={20} className="text-[#709028]" />
    </div>
  );
  if (mimeType?.includes('pdf')) return (
    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
      <FileText size={20} className="text-blue-500" />
    </div>
  );
  return (
    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
      <File size={20} className="text-gray-400" />
    </div>
  );
}

function fmtDate(iso?: string, isAr?: boolean) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

function DownloadBtn({ url, name }: { url: string; name: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try { await downloadFile(url, name); }
    finally { setLoading(false); }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#709028]
                 hover:bg-[#D8EBAE]/40 flex items-center justify-center transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : <Download size={14} />}
    </button>
  );
}

interface Props {
  attachments:   SeoTaskAttachment[];
  onUploadFiles: (files: File[]) => void;
  onDelete?:     (attachmentId: number) => void;
  isUploading:   boolean;
  deletingId?:   number | null;
  isAr:          boolean;
  uploadError?:  string | null;
}

export function SeoAttachmentsTab({
  attachments,
  onUploadFiles,
  onDelete,
  isUploading,
  deletingId,
  isAr,
  uploadError,
}: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files?.length || isUploading) return;
    const list = Array.from(files);
    const validation = validateSeoFileSizes(list, SEO_ATTACHMENT_UPLOAD_MAX_MB);
    if (validation) {
      setLocalError(validation);
      return;
    }
    setLocalError(null);
    onUploadFiles(list);
  }

  const displayError = uploadError ?? localError;

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      <div
        onClick={() => !isUploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={[
          'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 transition-colors',
          isUploading ? 'cursor-wait opacity-70' : 'cursor-pointer',
          dragOver
            ? 'border-[#A0CD39] bg-[#D8EBAE]/20 dark:bg-[#A0CD39]/10'
            : 'border-gray-200 dark:border-gray-600 hover:border-[#A0CD39]/50 hover:bg-[#D8EBAE]/10',
        ].join(' ')}
      >
        {isUploading ? (
          <>
            <Loader2 size={22} className="animate-spin text-[#709028]" />
            <p className="text-sm text-[#709028] dark:text-[#A0CD39]">
              {isAr ? 'جاري الرفع...' : 'Uploading…'}
            </p>
          </>
        ) : (
          <>
            <Paperclip size={24} className={dragOver ? 'text-[#A0CD39]' : 'text-gray-300 dark:text-gray-600'} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
              {isAr ? 'اسحب الملفات هنا أو انقر للتصفح' : 'Drag files here or click to browse'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAr
                ? `صور، PDF، مستندات — حد ${SEO_ATTACHMENT_UPLOAD_MAX_MB} م.ب لكل ملف`
                : `Images, PDF, docs — max ${SEO_ATTACHMENT_UPLOAD_MAX_MB} MB each`}
            </p>
          </>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-red-500 text-center">{displayError}</p>
      )}

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {isAr ? 'لا توجد مرفقات' : 'No attachments yet'}
          </p>
        ) : (
          attachments.map(file => {
            const fullUrl = buildUrl(file.url);
            const isDeleting = deletingId === file.id;
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800
                           border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-1 shrink-0">
                  {onDelete && (
                    <button
                      type="button"
                      disabled={isDeleting || isUploading}
                      onClick={() => {
                        const ok = window.confirm(isAr
                          ? `حذف "${file.fileName}"؟`
                          : `Delete "${file.fileName}"?`);
                        if (ok) onDelete(file.id);
                      }}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500
                                 hover:bg-red-50 dark:hover:bg-red-900/20
                                 flex items-center justify-center transition-colors
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isDeleting
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  )}
                  {fullUrl
                    ? <DownloadBtn url={fullUrl} name={file.fileName} />
                    : <span className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 opacity-40">
                        <Download size={14} />
                      </span>
                  }
                </div>

                <div className="flex-1 text-end min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {[formatFileSize(file.size, isAr), fmtDate(file.uploadedAt, isAr)].filter(Boolean).join(' · ')}
                  </p>
                </div>

                <FileThumbnail mimeType={file.mimeType} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
