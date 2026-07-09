import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { attendanceExceptionApi } from '../api/attendanceException.api';
import type { ExceptionListParams } from '../types/attendanceException.types';

export function useEmployeeAttendanceExceptions(params?: ExceptionListParams) {
  return useQuery({
    queryKey: queryKeys.attendance.exceptions.employee(params),
    queryFn:  () => attendanceExceptionApi.employeeHistory(params).then((r) => r.data.data),
  });
}

export function useCancelAttendanceException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => attendanceExceptionApi.cancel(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'exceptions', 'employee'] });
    },
  });
}
