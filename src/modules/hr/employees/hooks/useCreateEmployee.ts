import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { AllFormData } from '../components/NewEmployeeForm/newEmployeeForm.types';
import type { EmploymentType } from '../types/employee.types';

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
          employment_type: d.jobType as EmploymentType,
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

      // Cache the completed employee so the detail page works immediately
      // (the backend has no GET /employees/:id endpoint)
      const finalEmp = {
        ...emp,
        employmentType: d.jobType as EmploymentType,
        salary:         d.salary,
        shiftStart:     d.startTime,
        shiftEnd:       d.endTime,
        onboardingStep: 4,
      };
      queryClient.setQueryData(['employee', id], finalEmp);

      return finalEmp;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
