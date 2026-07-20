import type { QueryClient } from '@tanstack/react-query';
import { attendanceTimerApi } from '../api/attendanceTimer.api';
import {
  attendancePausePath,
  canOfferPause,
  isActiveWorkDay,
  normalizeTodayPayload,
  withAnytimeAttendanceActions,
} from '../utils/attendanceTimer.utils';
import type { AttendanceScope, AttendanceTodayData } from '../types/attendanceTimer.types';

/** Shared react-query cache key for the attendance "today" payload — the single
 *  source of truth every `useWorkTimer()` instance and this headless bridge read/write. */
export function attendanceTodayQueryKey(scope: AttendanceScope) {
  return ['attendance', 'today', scope] as const;
}

/** Normalize a check-in/out/pause/resume response and write it into the shared cache.
 *  Used by both `useWorkTimer`'s own mutations and the headless auto-pause below, so
 *  every caller shapes the payload identically. */
export function applyAttendanceActionResult(
  qc: QueryClient,
  scope: AttendanceScope,
  data: unknown,
): AttendanceTodayData | null {
  const normalized = normalizeTodayPayload(data) ?? (data as AttendanceTodayData | null);
  const patched = normalized ? withAnytimeAttendanceActions(normalized) : normalized;
  qc.setQueryData(attendanceTodayQueryKey(scope), patched);
  return patched;
}

function readToday(qc: QueryClient, scope: AttendanceScope): AttendanceTodayData | null {
  return qc.getQueryData<AttendanceTodayData | null>(attendanceTodayQueryKey(scope)) ?? null;
}

/** Is the work timer actively running right now (checked in, not paused, not checked out)? */
export function isAttendanceRunning(qc: QueryClient, scope: AttendanceScope): boolean {
  const today = readToday(qc, scope);
  return isActiveWorkDay(today) && !(today?.isPaused || today?.workStatus === 'on_break');
}

/**
 * Auto-pause the work timer — used by the inactivity guard to pause after a period
 * of idle time. No-op (returns false) if there's nothing running to pause.
 */
export async function pauseAttendanceIfRunning(qc: QueryClient, scope: AttendanceScope): Promise<boolean> {
  const today = readToday(qc, scope);
  if (!today || !canOfferPause(today)) return false;
  const res = await attendanceTimerApi.action(today.pauseUrl ?? attendancePausePath(scope));
  applyAttendanceActionResult(qc, scope, res.data.data);
  return true;
}
