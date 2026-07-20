import { ExternalLink } from 'lucide-react';
import { normalizeTemplateLink } from '../utils/templateLink.utils';

interface Props {
  link?:    string | null;
  isAr?:    boolean;
  size?:    number;
  className?: string;
}

export function TemplateLinkButton({ link, isAr = false, size = 14, className = '' }: Props) {
  const href = normalizeTemplateLink(link);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={isAr ? 'فتح الرابط' : 'Open link'}
      title={isAr ? 'فتح الرابط' : 'Open link'}
      className={[
        'inline-flex items-center justify-center shrink-0 rounded-md',
        'text-[#709028] dark:text-[#A0CD39] hover:bg-[#D8EBAE]/40 dark:hover:bg-[#D8EBAE]/10',
        'transition-colors',
        className,
      ].join(' ')}
    >
      <ExternalLink size={size} />
    </a>
  );
}
