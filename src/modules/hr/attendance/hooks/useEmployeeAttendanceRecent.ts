import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';

export function useEmployeeAttendanceRecent(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', 'recent', employeeId],
    queryFn:  () => attendanceApi.employeeRecent(employeeId!).then((r) => {
      const d = r.data.data;
      if (Array.isArray(d)) return d;
      if (d && Array.isArray((d as { data?: unknown }).data)) return (d as { data: unknown[] }).data;
      return [];
    }),
    enabled:  !!employeeId,
  });
}
