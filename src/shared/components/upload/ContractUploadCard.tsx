import { useRef, useState } from 'react';
import { FileText, FileImage, File, Paperclip, Trash2, CalendarDays, Loader2 } from 'lucide-react';
import type { ContractFile } from '@/shared/types/contract.types';
import { formatFileSize, CONTRACT_UPLOAD_MAX_MB, validateContractFile } from '@/shared/utils/contractFile.utils';
import { buildAuthMediaUrl } from '@/shared/components/chat/authMediaUrl';
import { DownloadButton } from '@/shared/components/ui/DownloadButton';
import { CopyAttachmentLinkButton } from '@/shared/components/ui/CopyAttachmentLinkButton';

interface Props {
  contract:      ContractFile | null;
  onUploadFile?: (file: File) => void;
  onRemove?:     () => void;
  isUploading:   boolean;
  isRemoving?:   boolean;
  isAr:          boolean;
  uploadError?:  string | null;
  /** true for HR/super-admin management surfaces; false for self-service download-only view. */
  canManage:     boolean;
}

function fmtDate(iso?: string, isAr?: boolean) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

function FileThumbnail({ mimeType }: { mimeType?: string }) {
  if (mimeType?.includes('image')) return (
    <div className="w-12 h-12 rounded-xl bg-[#D8EBAE]/70 dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
      <FileImage size={20} className="text-[#709028]" />
    </div>
  );
  if (mimeType?.includes('pdf')) return (
    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
      <FileText size={20} className="text-blue-500" />
    </div>
  );
  return (
    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
      <File size={20} className="text-gray-400" />
    </div>
  );
}

export function ContractUploadCard({
  contract,
  onUploadFile,
  onRemove,
  isUploading,
  isRemoving,
  isAr,
  uploadError,
  canManage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!onUploadFile || !files?.length || isUploading) return;
    const file = files[0];
    const validation = validateContractFile(file);
    if (validation) {
      setLocalError(validation);
      return;
    }
    setLocalError(null);
    onUploadFile(file);
  }

  const displayError = uploadError ?? localError;
  const fullUrl = contract ? buildAuthMediaUrl(contract.url) : '';

  return (
    <div className="space-y-4">
      {contract && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100
                        dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <FileThumbnail mimeType={contract.mimeType} />

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {contract.fileName}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
              {formatFileSize(contract.size, isAr) && <span>{formatFileSize(contract.size, isAr)}</span>}
              {contract.uploadedAt && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} /> {fmtDate(contract.uploadedAt, isAr)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {fullUrl && (
              <>
                <DownloadButton url={fullUrl} name={contract.fileName} />
                <CopyAttachmentLinkButton url={fullUrl} isAr={isAr} />
              </>
            )}
            {canManage && onRemove && (
              <button
                type="button"
                disabled={isRemoving || isUploading}
                onClick={() => {
                  const ok = window.confirm(isAr
                    ? `حذف "${contract.fileName}"؟`
                    : `Delete "${contract.fileName}"?`);
                  if (ok) onRemove();
                }}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500
                           hover:bg-red-50 dark:hover:bg-red-900/20
                           flex items-center justify-center transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRemoving
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />}
              </button>
            )}
          </div>
        </div>
      )}

      {!contract && !canManage && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
          {isAr ? 'لا يوجد عقد مرفوع بعد' : 'No contract uploaded yet'}
        </p>
      )}

      {canManage && !contract && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
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
                  {isAr ? 'اسحب ملفاً هنا أو انقر للتصفح' : 'Drag a file here or click to browse'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isAr
                    ? `PDF أو صورة — حد ${CONTRACT_UPLOAD_MAX_MB} م.ب`
                    : `PDF or image — max ${CONTRACT_UPLOAD_MAX_MB} MB`}
                </p>
              </>
            )}
          </div>
        </>
      )}

      {displayError && (
        <p className="text-sm text-red-500 text-center">{displayError}</p>
      )}
    </div>
  );
}
