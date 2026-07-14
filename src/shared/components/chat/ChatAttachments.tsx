import { FileText } from 'lucide-react';
import { AuthImage } from './AuthImage';
import { buildAuthMediaUrl } from './authMediaUrl';
import { CopyAttachmentLinkButton } from '@/shared/components/ui/CopyAttachmentLinkButton';
import { useLang } from '@/app/providers/LanguageProvider';

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
  const { lang } = useLang();
  const isAr = lang === 'ar';

  if (!attachments.length) return null;

  return (
    <>
      {attachments.map((att, i) => {
        const url = buildAuthMediaUrl(att.url);
        const label = att.name ?? att.fileName ?? 'file';
        const key = String(att.id ?? i);

        if (isImageAttachment(att) && url) {
          return (
            <div key={key} className="relative mt-1 mb-1 inline-block max-w-full">
              <AuthImage
                src={url}
                alt={label}
                className="max-w-full max-h-56 rounded-xl object-cover cursor-pointer"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              />
              <div className="absolute top-1.5 inset-e-1.5">
                <CopyAttachmentLinkButton
                  url={url}
                  isAr={isAr}
                  size={13}
                  className="w-7 h-7 rounded-lg bg-black/45 text-white hover:bg-black/60
                             flex items-center justify-center transition-colors"
                />
              </div>
            </div>
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
          <div
            key={key}
            className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-xs
                        ${isOwn ? 'bg-white/30' : 'bg-gray-50 dark:bg-gray-700'}`}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 min-w-0 flex-1 transition-colors
                          ${isOwn
                            ? 'hover:opacity-80'
                            : 'hover:text-gray-900 dark:hover:text-gray-100'}`}
            >
              <FileText size={14} className="shrink-0" />
              <span className="truncate max-w-37.5">{label}</span>
              {att.size != null && <span className="shrink-0 opacity-60">{fmtSize(att.size)}</span>}
            </a>
            <CopyAttachmentLinkButton
              url={url}
              isAr={isAr}
              size={13}
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-colors
                          ${isOwn
                            ? 'text-white/80 hover:bg-white/20'
                            : 'text-gray-400 hover:text-[#709028] hover:bg-[#D8EBAE]/40'}`}
            />
          </div>
        );
      })}
    </>
  );
}
