import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeApi } from '../../api/employee.api';
import { useDepartments, useJobTitles } from '../../hooks/useLookups';
import { JOB_TYPES, MANAGERS } from '../NewEmployeeForm/newEmployeeForm.types';
import type { EmploymentType } from '../../types/employee.types';
import type { FormValues, EditEmployeeModalProps } from './EditEmployeeModal.types';

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

function apiErrMsg(err: unknown): string | null {
  return (err as any)?.response?.data?.message ?? null;
}

function formDefaults(emp: EditEmployeeModalProps['emp']): FormValues {
  return {
    fullName:       emp.name,
    email:          emp.email,
    phone:          emp.phone ?? '',
    department:     String(emp.department?.id ?? ''),
    jobTitle:       String(emp.jobTitle?.id ?? ''),
    employmentType: apiTypeToForm(emp.employmentType),
    salary:         String(emp.salary ?? ''),
    shiftStart:     (emp.shiftStart ?? emp.shift_start ?? '').slice(0, 5),
    shiftEnd:       (emp.shiftEnd   ?? emp.shift_end   ?? '').slice(0, 5),
    managerId:      String(emp.manager?.id ?? 'none'),
  };
}

export function useEditEmployeeModal({ open, onClose, emp, isAr }: EditEmployeeModalProps) {
  const queryClient = useQueryClient();

  // Onboarding step 5 = submitted — step-specific POST endpoints are locked by the API
  const onboardingLocked = (emp.onboardingStep ?? 0) >= 5;

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: formDefaults(emp),
  });

  useEffect(() => {
    if (open) reset(formDefaults(emp));
  }, [open]);

  const { data: departments = [] } = useDepartments();
  const selectedDept               = useWatch({ control, name: 'department' });
  const { data: jobTitles = [] }   = useJobTitles(selectedDept || undefined);

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = jobTitles.map((j)   => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = JOB_TYPES.map((t)   => ({ id: t.id, label: isAr ? t.labelAr : t.labelEn }));
  const managerItems = MANAGERS.map((m)    => ({ id: m.id, label: m.label }));

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (onboardingLocked) return;

      const log = (label: string) => (e: unknown) =>
        console.warn(`[EditEmployee] ${label} failed:`, (e as any)?.response?.data);

      const calls: Promise<unknown>[] = [];

      if (data.employmentType !== apiTypeToForm(emp.employmentType)) {
        calls.push(
          employeeApi.updateEmploymentType(emp.id, {
            employment_type: mapJobType(data.employmentType),
          }).catch(log('employment-type')),
        );
      }

      const salary = parseFloat(data.salary);
      if (salary > 0 && salary !== (emp.salary ?? 0)) {
        calls.push(employeeApi.updateSalary(emp.id, { salary }).catch(log('salary')));
      }

      if (
        data.shiftStart && data.shiftEnd &&
        (data.shiftStart !== (emp.shiftStart ?? emp.shift_start ?? '').slice(0, 5) ||
         data.shiftEnd   !== (emp.shiftEnd   ?? emp.shift_end   ?? '').slice(0, 5))
      ) {
        calls.push(
          employeeApi.updateWorkSchedule(emp.id, {
            shift_start: data.shiftStart,
            shift_end:   data.shiftEnd,
          }).catch(log('work-schedule')),
        );
      }

      await Promise.all(calls);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', emp.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      onClose();
    },

    onError: (err) => {
      console.error('[EditEmployeeModal]', (err as any)?.response?.data);
      toast.error(apiErrMsg(err) || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
    },
  });

  return {
    register,
    control,
    handleSubmit,
    mutation,
    onboardingLocked,
    deptItems,
    jTitleItems,
    empTypeItems,
    managerItems,
    cbProps,
  };
}
