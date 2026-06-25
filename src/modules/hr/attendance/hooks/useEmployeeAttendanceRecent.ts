import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';

export function useEmployeeAttendanceRecent(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', 'recent', employeeId],
    queryFn:  () => attendanceApi.employeeRecent(employeeId!).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
