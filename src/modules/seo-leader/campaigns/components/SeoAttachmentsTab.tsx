import { useRef, useState }                              from 'react';
import { Paperclip, Trash2, Download, FileImage, FileText, File, Loader2 } from 'lucide-react';
import type { SeoAttachmentDetail } from './SeoTaskModal.types';
import { env }                       from '@/app/config/env';
import { TOKEN_KEY }                 from '@/app/config/constants';

/* ── Always rebuild URL with the real API origin ─────────────────────
   The backend may store localhost URLs in development; strip the host
   and attach the correct origin from VITE_API_BASE_URL.               */
const API_ORIGIN = (() => {
  try { return new URL(env.apiBaseUrl).origin; } catch { return ''; }
})();

function buildUrl(url?: string) {
  if (!url) return '';
  try {
    /* Parse whatever host the backend returned, keep only path+search */
    const { pathname, search } = new URL(url);
    return `${API_ORIGIN}${pathname}${search}`;
  } catch {
    /* It was already a relative path */
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}

/* ── Download: fetch+blob in production (same-origin), window.open fallback */
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
    /* CORS in dev or network error — open in new tab so user can save */
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function FileThumbnail({ type }: { type?: string }) {
  if (type?.includes('image')) return (
    <div className="w-12 h-12 rounded-lg bg-[#D8EBAE]/70 dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
      <FileImage size={20} className="text-[#709028]" />
    </div>
  );
  if (type?.includes('pdf')) return (
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

function fmtDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

/* ── Download button with loading state ──────────────────────────────── */
function DownloadBtn({ url, name }: { url: string; name: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try { await downloadFile(url, name); }
    catch (e) { console.error('Download failed', e); }
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

/* ── Props ───────────────────────────────────────────────────────────── */
interface Props {
  attachments: SeoAttachmentDetail[];
  onAdd:       (file: File) => void;
  isUploading: boolean;
  isAr:        boolean;
}

/* ── Component ───────────────────────────────────────────────────────── */
export function SeoAttachmentsTab({ attachments, onAdd, isUploading, isAr }: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(f => onAdd(f));
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={[
          'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors',
          dragOver
            ? 'border-[#A0CD39] bg-[#D8EBAE]/20 dark:bg-[#A0CD39]/10'
            : 'border-gray-200 dark:border-gray-600 hover:border-[#A0CD39]/50 hover:bg-[#D8EBAE]/10',
        ].join(' ')}
      >
        {isUploading ? (
          <p className="text-sm text-[#709028] dark:text-[#A0CD39]">
            {isAr ? 'جاري الرفع...' : 'Uploading…'}
          </p>
        ) : (
          <>
            <Paperclip size={24} className={dragOver ? 'text-[#A0CD39]' : 'text-gray-300 dark:text-gray-600'} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
              {isAr ? 'اسحب الملفات هنا أو انقر للتصفح' : 'Drag files here or click to browse'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? 'صور، PDF، مستندات، ZIP' : 'Images, PDF, Documents, ZIP'}
            </p>
          </>
        )}
      </div>

      {/* File list */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {isAr ? 'لا توجد مرفقات' : 'No attachments yet'}
          </p>
        ) : (
          attachments.map(file => {
            const fullUrl = buildUrl(file.url);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800
                           border border-gray-100 dark:border-gray-700"
              >
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled
                    className="w-8 h-8 rounded-lg text-gray-300 dark:text-gray-600
                               flex items-center justify-center opacity-40 cursor-not-allowed">
                    <Trash2 size={14} />
                  </button>
                  {fullUrl
                    ? <DownloadBtn url={fullUrl} name={file.name} />
                    : <span className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 opacity-40">
                        <Download size={14} />
                      </span>
                  }
                </div>

                {/* Meta */}
                <div className="flex-1 text-end min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {[file.size, file.uploadedBy, fmtDate(file.createdAt)].filter(Boolean).join(' · ')}
                  </p>
                </div>

                {/* Thumbnail */}
                <FileThumbnail type={file.type} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
