import { useAuth } from '@/modules/auth/context/AuthContext';
import { useWorkTimer } from '@/shared/modules/attendance/hooks/useWorkTimer';
import type { AttendanceScope } from '@/shared/modules/attendance/types/attendanceTimer.types';

export interface AttendanceWidgetState {
  isActiveDay: boolean;
}

/** Sidebar attendance state for layout chrome (e.g. sidebar indicator). */
export function useAttendanceWidget(layoutScope?: AttendanceScope): AttendanceWidgetState {
  const { isSuperAdmin } = useAuth();
  const { isActiveDay } = useWorkTimer({ layoutScope, enabled: !isSuperAdmin });
  return { isActiveDay: isSuperAdmin ? false : isActiveDay };
}
