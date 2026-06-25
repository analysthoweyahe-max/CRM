import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { AllFormData } from '../components/NewEmployeeForm/newEmployeeForm.types';
import type { EmploymentType } from '../types/employee.types';

function mapJobType(jt: string): EmploymentType {
  if (jt === 'part-time') return 'part_time';
  if (jt === 'freelance') return 'freelance';
  return 'full_time';
}

function isAlreadySentError(err: unknown): boolean {
  const status: number = (err as any)?.response?.status ?? 0;
  const msg: string    = (err as any)?.response?.data?.message ?? '';
  return status === 422 && msg.toLowerCase().includes('already');
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AllFormData) => {
      const d = formData.step1!;

      // 1. Create employee record
      const created = await employeeApi.create({
        name:          d.fullName,
        email:         d.email,
        phone:         d.phone ?? '',
        department_id: d.department,
        job_title_id:  d.jobTitle,
        joining_date:  d.hireDate,
      });

      const emp  = created.data.data;
      const id   = emp.id;
      const step = emp.onboardingStep ?? 0;

      // 2. Employment type — skip if already done
      if (step < 2) {
        await employeeApi.updateEmploymentType(id, {
          employment_type: mapJobType(d.jobType),
        });
      }

      // 3. Salary — skip if already done
      if (step < 3 && d.salary > 0) {
        await employeeApi.updateSalary(id, { salary: d.salary });
      }

      // 4. Work schedule — skip if already done
      if (step < 4) {
        await employeeApi.updateWorkSchedule(id, {
          shift_start: d.startTime,
          shift_end:   d.endTime,
        });
      }

      // 5. Submit / send invite — skip if already submitted
      if (step < 5) {
        try {
          await employeeApi.submit(id);
        } catch (err) {
          // "invitation already sent" means employee is already finalised — treat as success
          if (!isAlreadySentError(err)) throw err;
        }
      }

      return emp;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
