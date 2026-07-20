import type { Role } from '@/shared/types/role.types';
import { timeToMinutes } from '@/shared/utils/attendanceWindow.utils';
import { utcClockToLocal } from '@/shared/utils/date.utils';
import type {
  AttendanceScope,
  AttendanceTodayData,
  AttendanceTimer,
  WorkStatus,
} from '../types/attendanceTimer.types';

/** Strip leading /api when axios baseURL already includes it. */
export function normalizeApiPath(path: string): string {
  return path.startsWith('/api/') ? path.replace(/^\/api/, '') : path;
}

export function resolveAttendanceScope(
  role: Role | undefined,
  section?: string,
  layoutScope?: AttendanceScope,
): AttendanceScope {
  if (layoutScope) return layoutScope;
  switch (role) {
    case 'manager':     return 'pm';
    case 'seo-member':
    case 'seo-leader': return 'seo';
    case 'employee':    return 'employee';
    case 'admin':
      if (section === 'seo') return 'seo';
      if (section === 'pm')  return 'pm';
      return 'employee';
    default:
      return 'employee';
  }
}

const SCOPE_PREFIX: Record<AttendanceScope, string> = {
  employee: '/v1/employee/attendance',
  pm:       '/v1/pm/attendance',
  seo:      '/v1/seo/attendance',
};

export function attendanceTodayPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/today`;
}

export function attendanceCheckInPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/check-in`;
}

export function attendanceCheckOutPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/check-out`;
}

export function attendancePausePath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/pause`;
}

export function attendanceResumePath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/resume`;
}

export function attendanceHistoryPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/history`;
}

export function attendanceSummaryPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/summary`;
}

function hasCheckedOut(today: AttendanceTodayData): boolean {
  return Boolean(today.record?.checkOutTime ?? today.checkOutTime);
}

function hasCheckedIn(today: AttendanceTodayData): boolean {
  return Boolean(today.record?.checkInTime ?? today.checkInTime);
}

function isInWorkSession(today: AttendanceTodayData): boolean {
  return (
    today.isWorking === true
    || today.isPaused === true
    || today.workStatus === 'currently_working'
    || today.workStatus === 'on_break'
  );
}

/** Parse UTC "HH:MM" / "HH:MM:SS" as today's Date (UTC clock → absolute instant). */
function utcClockTimeToday(time: string): Date | null {
  const parts = time.split(':').map(Number);
  if (parts.length < 2 || parts.some(n => Number.isNaN(n))) return null;
  const [h, m, s = 0] = parts;
  const d = new Date();
  d.setUTCHours(h, m, s, 0);
  return d;
}

/**
 * Derive decimal hours from check-in / check-out clock times when the API
 * omits workingHours (common after early leave / inconsistent today payloads).
 */
export function deriveWorkingHours(today: AttendanceTodayData | null): number | null {
  if (!today) return null;
  const reported = today.workingHours ?? today.record?.workingHours ?? null;
  if (reported != null && reported > 0) return reported;

  const inTime  = today.record?.checkInTime  ?? today.checkInTime  ?? null;
  const outTime = today.record?.checkOutTime ?? today.checkOutTime ?? null;
  if (!inTime) return reported;

  const start = utcClockTimeToday(inTime);
  if (!start) return reported;

  const end = outTime ? utcClockTimeToday(outTime) : new Date();
  if (!end) return reported;

  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  return hours > 0 ? hours : reported;
}

/**
 * Check-in is always available outside an active session.
 * Ignores API canCheckIn flags that may be gated by shift hours.
 */
export function canOfferCheckIn(today: AttendanceTodayData | null): boolean {
  if (!today) return true;
  if (hasCheckedOut(today)) return false;
  if (isInWorkSession(today)) return false;
  return true;
}

/**
 * Check-out is always available during an active session (or after check-in).
 * Ignores API canCheckOut flags that may be gated by shift hours.
 */
export function canOfferCheckOut(today: AttendanceTodayData | null): boolean {
  if (!today) return false;
  if (hasCheckedOut(today)) return false;
  if (isInWorkSession(today)) return true;
  return hasCheckedIn(today);
}

/** Pause — trust GET .../today canPause while still in an open session. */
export function canOfferPause(today: AttendanceTodayData | null): boolean {
  if (!today || hasCheckedOut(today)) return false;
  if (today.canPause === true) return true;
  return isInWorkSession(today) && !today.isPaused && today.workStatus !== 'on_break';
}

/**
 * Resume — available when paused, or after check-out to continue the work day.
 * Prefers API canResume; falls back to paused / checked-out session state.
 */
export function canOfferResume(today: AttendanceTodayData | null): boolean {
  if (!today) return false;
  if (today.canResume === true) return true;
  if (today.isPaused || today.workStatus === 'on_break') return true;
  // After check-out, resume is still a normal action to continue work
  if (hasCheckedOut(today) && hasCheckedIn(today)) return true;
  return false;
}

/** Patch today payload so UI actions are not blocked by shift-hour API flags. */
export function withAnytimeAttendanceActions(today: AttendanceTodayData): AttendanceTodayData {
  return {
    ...today,
    canCheckIn:  canOfferCheckIn(today),
    canCheckOut: canOfferCheckOut(today),
  };
}

/** Decimal hours → HH:MM:SS */
export function formatWorkingHours(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours)) return '00:00:00';
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export function formatBreakMinutes(minutes: number, isAr: boolean): string {
  if (minutes <= 0) return isAr ? '0 د' : '0m';
  return isAr ? `${minutes} د` : `${minutes}m`;
}

/** Break = (end − check-in) − working hours. Uses current time when still checked in. */
export function calcTodayBreakMinutes(
  checkIn: string | null | undefined,
  workingHours: number | null | undefined,
  checkOut?: string | null | undefined,
  /** Changing value (e.g. live timer tick) — only used to keep callers re-rendering. */
  _liveTick?: number | null,
): number {
  void _liveTick;
  if (!checkIn || workingHours == null || Number.isNaN(workingHours)) return 0;

  const start = utcClockTimeToday(checkIn);
  if (!start) return 0;

  const end = checkOut ? utcClockTimeToday(checkOut) : new Date();
  if (!end) return 0;

  const spanMinutes = (end.getTime() - start.getTime()) / 60_000;
  return Math.max(0, Math.round(spanMinutes - workingHours * 60));
}

/**
 * Break duration in minutes when the API omits breakMinutes:
 * (check-out − check-in) − workingHours.
 * Returns null when clocks / hours are incomplete.
 */
export function calcBreakMinutes(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  workingHours: number | null | undefined,
): number | null {
  const inMin = timeToMinutes(checkIn);
  const outMin = timeToMinutes(checkOut);
  if (inMin == null || outMin == null || workingHours == null || Number.isNaN(workingHours)) {
    return null;
  }
  let span = outMin - inMin;
  if (span < 0) span += 24 * 60; // overnight shift
  return Math.max(0, Math.round(span - workingHours * 60));
}

/** Bare UTC "HH:MM:SS" → local 12h display */
export function formatClockTime(time: string | null | undefined, isAr: boolean): string {
  const local = utcClockToLocal(time);
  if (!local) return '--:--';
  const [hStr, mStr] = local.split(':');
  const h24 = parseInt(hStr, 10);
  if (Number.isNaN(h24)) return '--:--';
  const period = h24 >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12    = h24 % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${mStr} ${period}`;
}

export function breakElapsedSeconds(startedAt: string | null): number {
  if (!startedAt) return 0;
  const normalized = startedAt.includes('T') ? startedAt : startedAt.replace(' ', 'T');
  return Math.max(0, Math.floor((Date.now() - new Date(normalized).getTime()) / 1000));
}

export function workStatusStyle(status: WorkStatus): {
  dot: string;
  text: string;
  badge: string;
} {
  switch (status) {
    case 'currently_working':
      return {
        dot:   'bg-[#709028]',
        text:  'text-[#709028] dark:text-[#A0CD39]',
        badge: 'bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/15 text-[#709028] dark:text-[#A0CD39]',
      };
    case 'on_break':
      return {
        dot:   'bg-amber-500',
        text:  'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        dot:   'bg-gray-400',
        text:  'text-gray-400',
        badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
      };
  }
}

/** Normalize POST action response — may be full today payload or record with nested timer. */
export function normalizeTodayPayload(data: unknown): AttendanceTodayData | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;

  if ('workStatus' in d && 'canCheckIn' in d) {
    return d as unknown as AttendanceTodayData;
  }

  if ('timer' in d && d.timer && typeof d.timer === 'object') {
    const timer = d.timer as AttendanceTimer;
    const record = d as unknown as AttendanceTodayData['record'];
    return {
      workStatus:           timer.workStatus,
      workStatusLabel:      '',
      workingHours:         timer.workingHours ?? (d.workingHours as number | null) ?? null,
      breakMinutes:         (d.breakMinutes as number) ?? 0,
      isPaused:             timer.workStatus === 'on_break',
      isWorking:            timer.workStatus === 'currently_working',
      canCheckIn:           false,
      canCheckOut:          true,
      canPause:             timer.canPause,
      canResume:            timer.canResume,
      activeBreakStartedAt: null,
      record,
      employee:             { id: '', name: '' },
    };
  }

  return null;
}

export function isActiveWorkDay(today: AttendanceTodayData | null): boolean {
  if (!today) return false;
  if (hasCheckedOut(today)) return false;
  // Prefer check-in presence over workStatus — backend sometimes returns offline while still checked in
  return hasCheckedIn(today) || isInWorkSession(today);
}

export function mergeDashboardCheckIn(
  today: AttendanceTodayData | null,
  checkIn?: Partial<AttendanceTimer> | null,
): AttendanceTodayData | null {
  if (!checkIn) return today;
  if (today) return today;
  return {
    workStatus:           checkIn.workStatus ?? 'offline',
    workStatusLabel:      checkIn.workStatusLabel ?? '',
    workingHours:         checkIn.workingHours ?? null,
    breakMinutes:         checkIn.breakMinutes ?? 0,
    isPaused:             checkIn.isPaused ?? false,
    isWorking:            checkIn.isWorking ?? false,
    canCheckIn:           checkIn.canCheckIn ?? (checkIn.workStatus === 'offline' || checkIn.workStatus == null),
    canCheckOut:          checkIn.canCheckOut ?? false,
    canPause:             checkIn.canPause ?? false,
    canResume:            checkIn.canResume ?? false,
    activeBreakStartedAt: checkIn.activeBreakStartedAt ?? null,
    checkInTime:          checkIn.checkInTime,
    checkOutTime:         checkIn.checkOutTime,
    checkInUrl:           checkIn.checkInUrl,
    checkOutUrl:          checkIn.checkOutUrl,
    pauseUrl:             checkIn.pauseUrl,
    resumeUrl:            checkIn.resumeUrl,
    attendanceTodayUrl:   checkIn.attendanceTodayUrl,
    record:               null,
    employee:             { id: '', name: '' },
  };
}
