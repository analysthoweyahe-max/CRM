import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { ApiEmployee, EmploymentType } from '../types/employee.types';

export interface UpdateEmployeeFormData {
  name:           string;
  email:          string;
  phone:          string;
  department_id:  string;
  job_title_id:   string;
  manager_id?:    string | null;
  employmentType: string;
  salary:         number;
  shiftStart:     string;
  shiftEnd:       string;
}

export function useUpdateEmployee(employeeId: string, original?: ApiEmployee) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEmployeeFormData) => {
      const calls: Promise<unknown>[] = [];

      if (data.employmentType && data.employmentType !== (original?.employmentType ?? '')) {
        calls.push(
          employeeApi.updateEmploymentType(employeeId, {
            employment_type: data.employmentType as EmploymentType,
          }),
        );
      }

      if (data.salary > 0 && data.salary !== (original?.salary ?? 0)) {
        calls.push(
          employeeApi.updateSalary(employeeId, { salary: data.salary }),
        );
      }

      if (
        data.shiftStart !== (original?.shiftStart ?? '') ||
        data.shiftEnd   !== (original?.shiftEnd   ?? '')
      ) {
        calls.push(
          employeeApi.updateWorkSchedule(employeeId, {
            shift_start: data.shiftStart,
            shift_end:   data.shiftEnd,
          }),
        );
      }

      await Promise.all(calls);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
