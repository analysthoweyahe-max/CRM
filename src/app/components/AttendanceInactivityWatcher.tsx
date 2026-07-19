import { useAttendanceInactivityGuard } from '@/shared/modules/attendance/hooks/useAttendanceInactivityGuard';

/** Headless: auto-pauses the work timer after long inactivity / tab leave. */
export function AttendanceInactivityWatcher() {
  useAttendanceInactivityGuard();
  return null;
}
