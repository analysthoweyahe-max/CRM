import { ExternalLink, Link2 } from 'lucide-react';

interface Props {
  links?:   string[] | null;
  isAr:     boolean;
  /** Compact row for task cards (icons + truncated host). */
  compact?: boolean;
  /** When false, only the link list is rendered (parent supplies the label). */
  showLabel?: boolean;
  className?: string;
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function truncateLabel(url: string, max = 52): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function LinkAnchor({
  url,
  label,
  className,
}: {
  url: string;
  label: string;
  className: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className={className}
      title={url}
      dir="ltr"
    >
      <ExternalLink size={13} className="shrink-0" />
      <span className="truncate min-w-0">{label}</span>
    </a>
  );
}

export function ImportantLinksDisplay({
  links, isAr, compact = false, showLabel = true, className,
}: Props) {
  const items = (links ?? []).map(l => l.trim()).filter(Boolean);
  if (!items.length) return null;

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className ?? ''}`}>
        <Link2 size={12} className="text-gray-400 shrink-0" />
        {items.map((url, i) => (
          <a
            key={`${i}-${url}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-[#709028] dark:text-[#A0CD39]
                       hover:underline max-w-[140px] truncate"
            title={url}
            dir="ltr"
          >
            {hostLabel(url)}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 min-w-0 ${className ?? ''}`}>
      {showLabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isAr ? 'روابط هامة' : 'Important Links'}
        </p>
      )}
      <ul className="space-y-1.5 min-w-0">
        {items.map((url, i) => (
          <li key={`${i}-${url}`} className="min-w-0">
            <LinkAnchor
              url={url}
              label={truncateLabel(url)}
              className="inline-flex items-center gap-1.5 max-w-full text-sm text-[#709028] dark:text-[#A0CD39]
                         hover:underline"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
