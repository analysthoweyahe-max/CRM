import type { TaskSession, TaskTimeLogSummary } from '@/modules/employee/tasks/types/taskDetail.types';

function num(...values: unknown[]): number | undefined {
  for (const v of values) {
    if (v == null || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function str(...values: unknown[]): string {
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return '';
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickSessionsArray(raw: Record<string, unknown>): unknown[] {
  if (Array.isArray(raw.sessions)) return raw.sessions;
  if (Array.isArray(raw.data)) return raw.data;
  const nested = asRecord(raw.data);
  if (nested && Array.isArray(nested.sessions)) return nested.sessions;
  if (nested && Array.isArray(nested.data)) return nested.data;
  return [];
}

function mapSession(raw: unknown): TaskSession | null {
  const r = asRecord(raw);
  if (!r || r.id == null) return null;

  const durationHours =
    num(r.durationHours, r.duration_hours, r.hours, r.duration)
    ?? (num(r.durationMinutes, r.duration_minutes) != null
      ? (num(r.durationMinutes, r.duration_minutes)! / 60)
      : 0);

  return {
    id:            String(r.id),
    date:          str(r.workDate, r.work_date, r.date),
    from:          str(r.startedAt, r.started_at, r.from, r.start),
    to:            str(r.endedAt, r.ended_at, r.to, r.end),
    durationHours: Math.round(durationHours * 100) / 100,
  };
}

/**
 * Normalize GET .../time-logs payloads (camelCase + snake_case, sessions|data).
 * Optionally merge a task-level estimated/allocated hours fallback.
 */
export function normalizeTimeLogSummary(
  raw: unknown,
  fallbackEstimatedHours = 0,
): TaskTimeLogSummary {
  const root = asRecord(raw) ?? {};
  const sessions = pickSessionsArray(root)
    .map(mapSession)
    .filter((s): s is TaskSession => !!s);

  const summed = sessions.reduce((a, s) => a + s.durationHours, 0);
  const apiTotal = num(root.totalHours, root.total_hours);
  // Prefer the larger of API total vs session sum — covers open timers in total
  // and missing totalHours when sessions already carry durationHours.
  const totalHours = Math.max(apiTotal ?? 0, summed);

  const estimatedHours =
    num(root.estimatedHours, root.estimated_hours, root.allocatedHours, root.allocated_hours)
    || Number(fallbackEstimatedHours)
    || 0;

  const apiRemaining = num(root.remainingHours, root.remaining_hours);
  const remainingHours = estimatedHours > 0
    ? Math.max(0, Math.round((estimatedHours - totalHours) * 100) / 100)
    : (apiRemaining ?? 0);

  const apiProgress = num(root.progressPercent, root.progress_percent);
  const progressPercent = estimatedHours > 0
    ? Math.min(100, Math.round((totalHours / estimatedHours) * 1000) / 10)
    : (apiProgress ?? 0);

  return { sessions, totalHours, estimatedHours, remainingHours, progressPercent };
}

/** Format a work-date (YYYY-MM-DD or ISO) without timezone day-shift. */
export function formatTimeLogDate(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format session clock — HH:MM wall clock as-is; ISO timestamps → local time. */
export function formatTimeLogClock(raw: string | null | undefined, isAr: boolean): string {
  if (!raw) return '—';
  const trimmed = raw.trim();
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (clock) {
    return `${clock[1]!.padStart(2, '0')}:${clock[2]}`;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
