import { externalLinkHref } from '@/shared/utils/format.utils';

/** Normalize a template link for href/open; returns null when empty. */
export function normalizeTemplateLink(link: string | null | undefined): string | null {
  return externalLinkHref(link);
}

export function openTemplateLink(link: string | null | undefined): void {
  const url = normalizeTemplateLink(link);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

export function truncateTemplateLink(link: string, max = 48): string {
  if (link.length <= max) return link;
  return `${link.slice(0, max - 1)}…`;
}
