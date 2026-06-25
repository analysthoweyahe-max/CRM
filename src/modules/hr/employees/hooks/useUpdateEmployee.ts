import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { ApiEmployee, EmploymentType } from '../types/employee.types';

function mapJobType(jt: string): EmploymentType {
  if (jt === 'part-time') return 'part_time';
  if (jt === 'freelance') return 'freelance';
  return 'full_time';
}

function apiTypeToForm(t: EmploymentType | null | undefined): string {
  if (t === 'part_time') return 'part-time';
  if (t === 'freelance') return 'freelance';
  return 'full-time';
}

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

      if (data.employmentType !== apiTypeToForm(original?.employmentType)) {
        calls.push(
          employeeApi.updateEmploymentType(employeeId, {
            employment_type: mapJobType(data.employmentType),
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
