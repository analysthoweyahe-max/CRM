import type { Role } from '@/shared/types/role.types';
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

export function attendanceHistoryPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/history`;
}

export function attendanceSummaryPath(scope: AttendanceScope): string {
  return `${SCOPE_PREFIX[scope]}/summary`;
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

/** Bare "HH:MM:SS" → 12h display */
export function formatClockTime(time: string | null | undefined, isAr: boolean): string {
  if (!time) return '--:--';
  const [hStr, mStr] = time.split(':');
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
  return today.workStatus !== 'offline' && !today.record?.checkOutTime;
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
    canCheckIn:           checkIn.canCheckIn ?? false,
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
