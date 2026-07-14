import { useState, type MouseEvent } from 'react';
import { Link, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  url:   string;
  isAr:  boolean;
  className?: string;
  size?: number;
}

/** Icon button that copies an attachment URL to the clipboard. */
export function CopyAttachmentLinkButton({ url, isAr, className, size = 14 }: Props) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  async function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(isAr ? 'تم نسخ رابط الملف' : 'File link copied');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(isAr ? 'تعذر نسخ الرابط' : 'Failed to copy link');
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isAr ? 'نسخ الرابط' : 'Copy link'}
      aria-label={isAr ? 'نسخ الرابط' : 'Copy link'}
      className={
        className
        ?? `w-8 h-8 rounded-lg text-gray-400 hover:text-[#709028]
            hover:bg-[#D8EBAE]/40 flex items-center justify-center transition-colors`
      }
    >
      {copied ? <Check size={size} className="text-[#709028]" /> : <Link size={size} />}
    </button>
  );
}
