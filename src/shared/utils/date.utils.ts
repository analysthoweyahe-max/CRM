/** Format date with year/month/day — used in lists and tables */
export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

/** Format date with bilingual (AR/EN) support — short month + day + year */
export function formatDateShort(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/** Format date with weekday — used in attendance/daily reports tables */
export function formatDateWithWeekday(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
}

/** Format date with full month name — used in leave requests */
export function formatDateFull(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

/** Returns true when the given date string is in the past */
export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}
