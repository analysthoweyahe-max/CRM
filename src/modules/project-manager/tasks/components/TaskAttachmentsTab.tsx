import { useRef, useState }  from 'react';
import { Paperclip, Trash2, Download, FileImage, FileText, File } from 'lucide-react';
import { CopyAttachmentLinkButton } from '@/shared/components/ui/CopyAttachmentLinkButton';
import { buildAuthMediaUrl } from '@/shared/components/chat/authMediaUrl';
import type { TaskAttachment } from '../types/taskModal.types';

interface Props {
  attachments: TaskAttachment[];
  onRemove?:   (id: string) => void;
  onAdd?:      (file: File) => void;
  onDownload:  (att: TaskAttachment) => void;
  isAr:        boolean;
}

function FileThumbnail({ type }: { type: TaskAttachment['fileType'] }) {
  if (type === 'image') return (
    <div className="w-12 h-12 rounded-lg bg-[#D8EBAE]/70 dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
      <FileImage size={20} className="text-[#709028]" />
    </div>
  );
  if (type === 'pdf') return (
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

export function TaskAttachmentsTab({ attachments, onRemove, onAdd, onDownload, isAr }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const canUpload = !!onAdd;

  function handleFiles(files: FileList | null) {
    if (!canUpload || !files) return;
    Array.from(files).forEach(file => onAdd(file));
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
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
            <Paperclip size={24} className={dragOver ? 'text-[#A0CD39]' : 'text-gray-300 dark:text-gray-600'} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isAr ? 'اسحب الملفات هنا أو انقر للتصفح' : 'Drag files here or click to browse'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? 'صور، PDF، مستندات، ZIP' : 'Images, PDF, Documents, ZIP'}
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        {attachments.map(file => {
          const fullUrl = buildAuthMediaUrl(file.url);
          return (
            <div key={file.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

              <div className="flex items-center gap-1 shrink-0">
                {onRemove && (
                  <button type="button" onClick={() => onRemove(file.id)}
                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
                <button type="button" onClick={() => onDownload(file)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40 flex items-center justify-center transition-colors">
                  <Download size={14} />
                </button>
                {fullUrl && <CopyAttachmentLinkButton url={fullUrl} isAr={isAr} />}
              </div>

              <div className="flex-1 text-right min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{file.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {file.sizeLabel} · {file.uploadedAt} · {file.uploadedBy}
                </p>
              </div>

              <FileThumbnail type={file.fileType} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
