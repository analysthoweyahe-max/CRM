import type { ReactNode } from 'react';
import { ensureHttpUrl } from '@/shared/utils/format.utils';

const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

interface Props {
  text:           string;
  className?:     string;
  linkClassName?: string;
}

/** Renders plain message text with clickable http(s)/www links. */
export function MessageBodyText({ text, className, linkClassName }: Props) {
  const parts: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(URL_RE.source, URL_RE.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    const raw = match[0];
    const cleaned = raw.replace(/[.,);!?]+$/, '');
    const suffix = raw.slice(cleaned.length);

    parts.push(
      <a
        key={`${match.index}-${cleaned}`}
        href={ensureHttpUrl(cleaned)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName ?? 'underline break-all hover:opacity-80'}
        onClick={e => e.stopPropagation()}
      >
        {cleaned}
      </a>,
    );
    if (suffix) parts.push(suffix);
    last = match.index + raw.length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return (
    <p className={className ?? 'text-sm leading-relaxed whitespace-pre-wrap wrap-break-word'}>
      {parts.length > 0 ? parts : text}
    </p>
  );
}
