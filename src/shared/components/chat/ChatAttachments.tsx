import { FileText } from 'lucide-react';
import { AuthImage } from './AuthImage';
import { buildAuthMediaUrl } from './authMediaUrl';

export interface ChatAttachmentLike {
  id?:       number | string;
  fileName?: string;
  name?:     string;
  mimeType?: string;
  type?:     string;
  size?:     number;
  url?:      string | null;
}

interface Props {
  attachments: ChatAttachmentLike[];
  isOwn?:      boolean;
}

function isImageAttachment(att: ChatAttachmentLike): boolean {
  const mime = (att.mimeType ?? att.type ?? '').toLowerCase();
  return mime.startsWith('image');
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatAttachments({ attachments, isOwn }: Props) {
  if (!attachments.length) return null;

  return (
    <>
      {attachments.map((att, i) => {
        const url = buildAuthMediaUrl(att.url);
        const label = att.name ?? att.fileName ?? 'file';
        const key = String(att.id ?? i);

        if (isImageAttachment(att) && url) {
          return (
            <AuthImage
              key={key}
              src={url}
              alt={label}
              className="mt-1 mb-1 max-w-full max-h-56 rounded-xl object-cover cursor-pointer"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            />
          );
        }

        if (!url) {
          return (
            <div
              key={key}
              className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs
                          ${isOwn ? 'bg-white/30' : 'bg-gray-50 dark:bg-gray-700'}`}
            >
              <FileText size={14} className="shrink-0" />
              <span className="truncate max-w-37.5">{label}</span>
              {att.size != null && <span className="shrink-0 opacity-60">{fmtSize(att.size)}</span>}
            </div>
          );
        }

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs transition-colors
                        ${isOwn
                          ? 'bg-white/30 hover:bg-white/50'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate max-w-37.5">{label}</span>
            {att.size != null && <span className="shrink-0 opacity-60">{fmtSize(att.size)}</span>}
          </a>
        );
      })}
    </>
  );
}
