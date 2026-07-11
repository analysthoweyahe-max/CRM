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
 * with no timezone marker. The API stores these in UTC, so parsing them as
 * local time shifts fresh notifications by the browser's UTC offset (e.g. +3h
 * in Saudi Arabia) and makes them look hours old.
 */
const NAIVE_TIMESTAMP_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;

export function parseBackendTimestamp(raw: string): Date {
  const match = NAIVE_TIMESTAMP_RE.exec(raw.trim());
  if (!match) return new Date(raw);

  const [, year, month, day, hour, minute, second] = match;
  return new Date(Date.UTC(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(minute), Number(second),
  ));
}

/**
 * Attendance check-in/out clocks from the API are UTC "HH:MM" / "HH:MM:SS"
 * with no timezone marker. Convert to the viewer's local clock for display
 * and shift-window checks (e.g. 06:14 UTC → 09:14 in Egypt UTC+3).
 */
export function utcClockToLocal(time: string | null | undefined): string | null {
  if (!time) return null;
  const trimmed = time.trim();
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = parts.length >= 3 ? Number(String(parts[2]).slice(0, 2)) : 0;
  if ([h, m, s].some(n => Number.isNaN(n))) return trimmed;

  const now = new Date();
  const local = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    h, m, s,
  ));

  const pad = (n: number) => String(n).padStart(2, '0');
  if (parts.length >= 3) {
    return `${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}`;
  }
  return `${pad(local.getHours())}:${pad(local.getMinutes())}`;
}

/** Relative "time ago" label — used in notification lists */
export function formatTimeAgo(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  const date = parseBackendTimestamp(raw);
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

/** Notification created-at label — date + clock time */
export function formatNotificationDateTime(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  const date = parseBackendTimestamp(raw);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}
