export type TaskPeriodFilter = '' | 'today' | '7days' | '30days' | 'custom';

function toDayKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Prefer leading YYYY-MM-DD from ISO strings; fall back to local Date parse.
  const isoDay = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDay)) return isoDay;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Match a task date against period presets (day / 7d / 30d / custom from–to). */
export function matchesTaskPeriod(
  dateValue: string | undefined | null,
  period: TaskPeriodFilter,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (!period) return true;
  const day = dateValue ? toDayKey(dateValue) : null;
  if (!day) return false;

  const today = todayKey();

  if (period === 'today') return day === today;
  if (period === '7days') {
    const start = addDays(today, -6);
    return day >= start && day <= today;
  }
  if (period === '30days') {
    const start = addDays(today, -29);
    return day >= start && day <= today;
  }
  if (period === 'custom') {
    if (!dateFrom && !dateTo) return true;
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  }
  return true;
}
