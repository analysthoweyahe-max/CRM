import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { AttendanceHistoryParams } from '../types/attendance.types';

export function useEmployeeAttendanceHistory(
  employeeId: string | undefined,
  params?: AttendanceHistoryParams,
) {
  return useQuery({
    queryKey: ['attendance', 'history', employeeId, params],
    queryFn:  () => attendanceApi.employeeHistory(employeeId!, params).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
