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

  const multiple = items.length > 1;

  return (
    <div className={`space-y-2 min-w-0 ${className ?? ''}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isAr ? 'روابط هامة' : 'Important Links'}
          </p>
          {multiple && (
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full
                             bg-[#709028]/10 dark:bg-[#A0CD39]/10
                             text-[10px] font-medium text-[#709028] dark:text-[#A0CD39] leading-none">
              {items.length}
            </span>
          )}
        </div>
      )}
      <ul className={`min-w-0 ${multiple ? 'space-y-1' : 'space-y-1.5'}`}>
        {items.map((url, i) => (
          <li key={`${i}-${url}`} className={`min-w-0 ${multiple ? 'flex items-start gap-2' : ''}`}>
            {multiple && (
              <span className="shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-full
                               bg-gray-100 dark:bg-gray-700 text-[10px] font-medium
                               text-gray-400 dark:text-gray-500 leading-none">
                {i + 1}
              </span>
            )}
            <LinkAnchor
              url={url}
              label={truncateLabel(url)}
              className="inline-flex items-center gap-1.5 max-w-full min-w-0 text-sm
                         text-[#709028] dark:text-[#A0CD39] hover:underline"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
