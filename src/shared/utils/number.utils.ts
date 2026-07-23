/** Safe wrappers around Number#toLocaleString — APIs often return null amounts. */

export function toSafeNumber(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Clamp a minutes form input to 0–max (default 59). Empty stays empty. */
export function clampMinutesInput(value: string, max = 59): string {
  if (value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Math.min(max, Math.max(0, Math.trunc(n))));
}

/** Parse optional minutes for API payloads, capped at 0–max (default 59). */
export function parseEstimatedMinutes(value: string | number | null | undefined, max = 59): number | undefined {
  if (value === '' || value == null) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(0, Math.trunc(n)));
}

export function formatLocaleNumber(
  value: unknown,
  locales?: string | string[],
  options?: Intl.NumberFormatOptions,
  empty = '—',
): string {
  if (value == null || value === '') return empty;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return empty;
  return n.toLocaleString(locales, options);
}

/**
 * Money display: 2 decimals + currency label.
 * `currency` is an ISO code from the API; null/empty falls back to EGP.
 * Arabic EGP keeps the local abbr ج.م; all other codes show as-is.
 * Null/NaN amount → 0.00 currency.
 */
export function formatMoneyAmount(
  amount: unknown,
  isAr: boolean,
  currency?: string | null,
): string {
  const code = currency?.trim().toUpperCase() || 'EGP';
  const formatted = formatLocaleNumber(amount, isAr ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }, '0.00');
  const label = isAr && code === 'EGP' ? 'ج.م' : code;
  return `${formatted} ${label}`;
}
