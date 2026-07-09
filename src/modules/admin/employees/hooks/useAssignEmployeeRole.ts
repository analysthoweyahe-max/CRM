import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import type { AssignEmployeeRolePayload } from '@/modules/hr/employees/types/employee.types';

export function useAssignEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignEmployeeRolePayload }) =>
      employeeApi.assignRole(id, payload),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'employees', 'detail', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'employees'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
