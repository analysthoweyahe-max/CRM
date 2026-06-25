import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { DailyAttendanceParams } from '../types/attendance.types';

export function useDailyAttendance(params?: DailyAttendanceParams) {
  return useQuery({
    queryKey: ['attendance', 'daily', params],
    queryFn:  () => attendanceApi.daily(params).then((r) => r.data.data),
  });
}
