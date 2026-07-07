import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeApi } from '../../api/employee.api';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../../hooks/useLookups';
import type { EmploymentType } from '../../types/employee.types';
import type { FormValues, EditEmployeeModalProps } from './EditEmployeeModal.types';

function apiErrMsg(err: unknown): string | null {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null;
}

function formDefaults(emp: EditEmployeeModalProps['emp']): FormValues {
  return {
    fullName:       emp.name,
    email:          emp.email,
    phone:          emp.phone ?? '',
    department:     String(emp.department?.id ?? ''),
    jobTitle:       String(emp.jobTitle?.id ?? ''),
    employmentType: emp.employmentType ?? '',
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

  const { data: departments = [] }      = useDepartments();
  const selectedDept                    = useWatch({ control, name: 'department' });
  const { data: jobTitles = [] }        = useJobTitles(selectedDept || undefined);
  const { data: employmentTypes = [] }  = useEmploymentTypes();

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = jobTitles.map((j)   => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = employmentTypes.map((t) => ({ id: t.value, label: t.label }));
  const { items: managerItems } = useManagerOptions(isAr, emp.id);

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      employeeApi.update(emp.id, {
        name:            data.fullName,
        email:           data.email,
        phone:           data.phone,
        department_id:   Number(data.department),
        job_title_id:    Number(data.jobTitle),
        manager_id:      data.managerId === 'none' ? null : data.managerId,
        /* Employment type / salary / schedule are locked once onboarding is submitted. */
        ...(onboardingLocked ? {} : {
          employment_type: data.employmentType as EmploymentType || undefined,
          salary:          parseFloat(data.salary) || undefined,
          shift_start:     data.shiftStart || undefined,
          shift_end:       data.shiftEnd   || undefined,
        }),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', emp.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      onClose();
    },

    onError: (err: unknown) => {
      console.error('[EditEmployeeModal]', (err as { response?: { data?: unknown } })?.response?.data);
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
