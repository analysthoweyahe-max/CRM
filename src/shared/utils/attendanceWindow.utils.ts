const DEFAULT_WINDOW_FROM = '10:00';
const DEFAULT_WINDOW_TO   = '12:00';
const DEFAULT_DAILY_HOURS   = 8;

export interface AttendanceWindowConfig {
  normalStartWindowFrom?: string;
  normalStartWindowTo?:   string;
  dailyWorkHours?:        number;
  lateAllowanceMinutes?:  number;
}

/** Normalize "HH:MM" or "HH:MM:SS" to minutes since midnight. */
export function timeToMinutes(raw?: string | null): number | null {
  if (!raw) return null;
  const [h, m] = raw.slice(0, 5).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function resolveWindowConfig(config?: AttendanceWindowConfig | null) {
  return {
    windowFrom: config?.normalStartWindowFrom?.slice(0, 5) ?? DEFAULT_WINDOW_FROM,
    windowTo:   config?.normalStartWindowTo?.slice(0, 5)   ?? DEFAULT_WINDOW_TO,
    dailyHours: config?.dailyWorkHours ?? DEFAULT_DAILY_HOURS,
    lateGrace:  config?.lateAllowanceMinutes ?? 15,
  };
}

export type CheckInTiming = 'normal' | 'early' | 'late' | 'unknown';

/** Classify check-in time against the normal start window. */
export function classifyCheckIn(
  checkInTime: string | null | undefined,
  config?: AttendanceWindowConfig | null,
): CheckInTiming {
  const mins = timeToMinutes(checkInTime);
  if (mins == null) return 'unknown';
  const { windowFrom, windowTo } = resolveWindowConfig(config);
  const from = timeToMinutes(windowFrom)!;
  const to   = timeToMinutes(windowTo)!;
  if (mins < from) return 'early';
  if (mins > to)   return 'late';
  return 'normal';
}

/** Classify current clock time (for pre-check-in warnings). */
export function classifyNow(config?: AttendanceWindowConfig | null): CheckInTiming {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const { windowFrom, windowTo } = resolveWindowConfig(config);
  const from = timeToMinutes(windowFrom)!;
  const to   = timeToMinutes(windowTo)!;
  if (mins < from) return 'early';
  if (mins > to)   return 'late';
  return 'normal';
}

/** Expected end = effective start (max(checkIn, windowFrom)) + working hours. */
export function calcExpectedEnd(
  checkInTime: string | null | undefined,
  workingHours: number,
  config?: AttendanceWindowConfig | null,
): string | null {
  const checkInMins = timeToMinutes(checkInTime);
  if (checkInMins == null || workingHours <= 0) return null;
  const { windowFrom } = resolveWindowConfig(config);
  const fromMins = timeToMinutes(windowFrom)!;
  const effectiveStart = Math.max(checkInMins, fromMins);
  return minutesToHHMM(effectiveStart + Math.round(workingHours * 60));
}

/** True when worked hours are within 30 minutes of expected daily hours. */
export function isNearDailyLimit(
  workedHours: number | null | undefined,
  expectedHours: number,
  threshold = 0.5,
): boolean {
  if (workedHours == null) return false;
  return workedHours >= expectedHours - threshold && workedHours < expectedHours;
}
