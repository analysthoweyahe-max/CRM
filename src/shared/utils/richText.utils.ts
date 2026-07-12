import DOMPurify from 'dompurify';

/** Plain-text preview of rich-text HTML — for cards, exports, and other non-formatted contexts. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return clean.replace(/\s+/g, ' ').trim();
}
