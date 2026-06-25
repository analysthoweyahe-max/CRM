import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { AttendanceHistoryParams, AttendanceHistoryResponse } from '../types/attendance.types';

export function useEmployeeAttendanceHistory(
  employeeId: string | undefined,
  params?: AttendanceHistoryParams,
) {
  return useQuery({
    queryKey: ['attendance', 'history', employeeId, params],
    queryFn:  (): Promise<AttendanceHistoryResponse['data']> =>
      attendanceApi.employeeHistory(employeeId!, params).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
