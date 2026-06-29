import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { ApiEmployeeAttendanceRecord } from '../types/attendance.types';

export function useEmployeeAttendanceRecent(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', 'recent', employeeId],
    queryFn:  (): Promise<ApiEmployeeAttendanceRecord[]> => attendanceApi.employeeRecent(employeeId!).then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d as ApiEmployeeAttendanceRecord[];
      if (d && Array.isArray((d as { data?: unknown }).data)) {
        return (d as { data: ApiEmployeeAttendanceRecord[] }).data;
      }
      return [];
    }),
    enabled:  !!employeeId,
  });
}
