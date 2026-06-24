import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { AllFormData } from '../components/NewEmployeeForm/newEmployeeForm.types';
import type { EmploymentType } from '../types/employee.types';

function mapJobType(jt: string): EmploymentType {
  if (jt === 'part-time') return 'part_time';
  if (jt === 'freelance') return 'freelance';
  return 'full_time';
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AllFormData) => {
      const d = formData.step1!;

      // 1. Create employee record
      const payload = {
        name:          d.fullName,
        email:         d.email,
        phone:         d.phone ?? '',
        department_id: d.department,
        job_title_id:  d.jobTitle,
        joining_date:  d.hireDate,
      };
      const created = await employeeApi.create(payload);

      const id = created.data.data.id;

      // 2. Employment type
      await employeeApi.updateEmploymentType(id, {
        employment_type: mapJobType(d.jobType),
      });

      // 3. Salary
      if (d.salary > 0) {
        await employeeApi.updateSalary(id, { salary: d.salary });
      }

      // 4. Work schedule
      await employeeApi.updateWorkSchedule(id, {
        shift_start: d.startTime,
        shift_end:   d.endTime,
      });

      // 5. Submit / finalise
      await employeeApi.submit(id);

      return created.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
