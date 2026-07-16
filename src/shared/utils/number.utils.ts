/** Safe wrappers around Number#toLocaleString — APIs often return null amounts. */

export function toSafeNumber(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
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

/** Money display: 2 decimals + EGP / ج.م. Null/NaN → 0.00 currency. */
export function formatMoneyAmount(amount: unknown, isAr: boolean): string {
  const formatted = formatLocaleNumber(amount, isAr ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }, '0.00');
  return `${formatted} ${isAr ? 'ج.م' : 'EGP'}`;
}
