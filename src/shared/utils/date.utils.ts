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

/**
 * TODO(backend): remove this once the API returns ISO 8601 timestamps with
 * timezone info (e.g. "2026-07-06T17:16:47Z" or "2026-07-06T17:16:47+03:00").
 *
 * The backend currently sends naive timestamps like "2026-07-06 17:16:47"
 * with no timezone marker. `new Date(...)` on a string like that is
 * ambiguous — engines disagree on whether a missing offset means UTC or
 * local time — which was shifting fresh notifications by the server's UTC
 * offset and making them look hours old.
 *
 * This parses the numeric components by hand and builds the Date from them,
 * which the Date constructor always evaluates in the *local* timezone —
 * i.e. it treats the backend value as the server's local time (matching the
 * browser's), not UTC. Once the backend sends a real offset, delete this
 * function and pass the raw string straight to `new Date(...)`.
 */
const NAIVE_TIMESTAMP_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;

function parseNaiveLocalTimestamp(raw: string): Date {
  const match = NAIVE_TIMESTAMP_RE.exec(raw.trim());
  if (!match) return new Date(raw); // already has an offset (or unrecognized) — parse as-is

  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(minute), Number(second),
  );
}

/** Relative "time ago" label — used in notification lists */
export function formatTimeAgo(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  const date = parseNaiveLocalTimestamp(raw);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year',   60 * 60 * 24 * 365],
    ['month',  60 * 60 * 24 * 30],
    ['week',   60 * 60 * 24 * 7],
    ['day',    60 * 60 * 24],
    ['hour',   60 * 60],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(isAr ? 'ar' : 'en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit) {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }
  return rtf.format(diffSec, 'second');
}
