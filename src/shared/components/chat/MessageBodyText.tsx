import type { ReactNode } from 'react';
import { ensureHttpUrl } from '@/shared/utils/format.utils';
import { MentionPopover } from './MentionPopover';
import type { MentionRef, ResolvedMention } from './mention.types';

const URL_PATTERN = 'https?:\\/\\/[^\\s<]+|www\\.[^\\s<]+';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Props {
  text:              string;
  className?:        string;
  linkClassName?:    string;
  /** Mention refs attached to this message, e.g. [{ type: 'employee', id: '076038' }]. */
  mentions?:         MentionRef[];
  /** Resolve a mention ref to display info (name/avatar) — usually a cached lookup, not a fetch. */
  getMentionInfo?:   (ref: MentionRef) => ResolvedMention | undefined;
  mentionClassName?: string;
  onMentionStartChat?: (ref: MentionRef) => void;
  isAr?:             boolean;
}

/** Renders plain message text with clickable http(s)/www links and, when provided, clickable @mentions. */
export function MessageBodyText({
  text, className, linkClassName,
  mentions, getMentionInfo, mentionClassName, onMentionStartChat, isAr = false,
}: Props) {
  const mentionEntries = (mentions ?? [])
    .map(ref => ({ ref, info: getMentionInfo?.(ref) }))
    .filter((e): e is { ref: MentionRef; info: ResolvedMention } => !!e.info?.name)
    .sort((a, b) => b.info.name.length - a.info.name.length);

  const mentionSource = mentionEntries.length
    ? mentionEntries.map(e => escapeRegExp(e.info.name)).join('|')
    : null;

  const combinedSource = mentionSource
    ? `(${URL_PATTERN})|(@(?:${mentionSource}))`
    : `(${URL_PATTERN})`;
  const re = new RegExp(combinedSource, 'gi');

  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    if (match[1]) {
      const raw = match[1];
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
    } else if (match[2]) {
      const label = match[2];
      const name = label.slice(1);
      const entry = mentionEntries.find(e => e.info.name === name);
      parts.push(
        <MentionPopover
          key={`${match.index}-${label}`}
          refData={entry!.ref}
          label={label}
          info={entry!.info}
          className={mentionClassName}
          isAr={isAr}
          onStartChat={onMentionStartChat}
        />,
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return (
    <p className={className ?? 'text-sm leading-relaxed whitespace-pre-wrap wrap-break-word'}>
      {parts.length > 0 ? parts : text}
    </p>
  );
}
