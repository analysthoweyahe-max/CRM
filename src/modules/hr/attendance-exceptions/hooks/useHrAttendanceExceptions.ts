import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import { attendanceExceptionApi } from '@/shared/modules/attendance/api/attendanceException.api';
import type { ExceptionListParams, RejectExceptionPayload } from '@/shared/modules/attendance/types/attendanceException.types';

export function useHrAttendanceExceptions(params?: ExceptionListParams) {
  return useQuery({
    queryKey: queryKeys.attendance.exceptions.hr(params),
    queryFn:  () => attendanceExceptionApi.hrList(params).then((r) => r.data.data),
  });
}

export function useApproveAttendanceException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => attendanceExceptionApi.approve(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'exceptions', 'hr'] });
    },
  });
}

export function useRejectAttendanceException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: RejectExceptionPayload }) =>
      attendanceExceptionApi.reject(uuid, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'exceptions', 'hr'] });
    },
  });
}
