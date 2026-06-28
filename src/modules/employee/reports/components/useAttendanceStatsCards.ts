import type { ApiEmployeeAttendanceRecord } from '@/modules/hr/attendance/types/attendance.types';
import type { AttendanceStats } from './AttendanceStatsCards.types';

export function useAttendanceStatsCards(records: ApiEmployeeAttendanceRecord[]): AttendanceStats {
  let present = 0, late = 0, absent = 0;
  for (const r of records) {
    if (r.day_status === 'present') present++;
    if (r.day_status === 'late')    { present++; late++; }
    if (r.day_status === 'absent')  absent++;
  }
  return { present, late, earlyOut: 0, absent };
}
