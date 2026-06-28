import type { ApiEmployeeAttendanceRecord } from '@/modules/hr/attendance/types/attendance.types';

export interface AttendanceHistoryTableProps {
  records:   ApiEmployeeAttendanceRecord[];
  isLoading: boolean;
  isAr:      boolean;
}
