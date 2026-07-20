import { toSafeNumber } from './number.utils';

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(toSafeNumber(amount));
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** Guards against links stored/typed without a scheme (e.g. "github.com/org/repo"),
 *  which the browser would otherwise resolve as a broken relative path. */
export function ensureHttpUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Returns a safe external href, or null when the input is empty. */
export function externalLinkHref(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  return trimmed ? ensureHttpUrl(trimmed) : null;
}

/** Alias for template link normalization. */
export const normalizeTemplateLink = externalLinkHref;

export function openTemplateLink(link: string | null | undefined): void {
  const url = externalLinkHref(link);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

/** Renders a task's estimate (hours + optional minutes) as e.g. "8h 30m" / "8 س 30 د". */
export function formatEstimatedTime(
  hours?:   number | null,
  minutes?: number | null,
  isAr = false,
): string {
  const h = hours   ?? 0;
  const m = minutes ?? 0;
  if (!h && !m) return '—';
  const parts: string[] = [];
  if (h) parts.push(isAr ? `${h} س` : `${h}h`);
  if (m) parts.push(isAr ? `${m} د` : `${m}m`);
  return parts.join(' ');
}
