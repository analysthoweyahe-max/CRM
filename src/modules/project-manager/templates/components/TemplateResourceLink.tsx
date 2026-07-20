import { ExternalLink } from 'lucide-react';
import { normalizeTemplateLink } from '../utils/templateLink.utils';

interface Props {
  link?:      string | null;
  isAr?:      boolean;
  className?: string;
}

export function TemplateResourceLink({ link, isAr = false, className = '' }: Props) {
  const href = normalizeTemplateLink(link);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-1.5 text-xs font-medium',
        'text-[#709028] dark:text-[#A0CD39] hover:underline',
        className,
      ].join(' ')}
    >
      <ExternalLink size={13} className="shrink-0" />
      {isAr ? 'عرض موارد القالب' : 'View template resources'}
    </a>
  );
}
