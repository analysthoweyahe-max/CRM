import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeApi } from '../../api/employee.api';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../../hooks/useLookups';
import {
  employeeDepartmentIds,
  titleDepartmentId,
  toDepartmentIds,
  type EmploymentType,
} from '../../types/employee.types';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import type { FormValues, EditEmployeeModalProps } from './EditEmployeeModal.types';

function formDefaults(emp: EditEmployeeModalProps['emp']): FormValues {
  return {
    fullName:       emp.name,
    email:          emp.email,
    phone:          emp.phone ?? '',
    departmentIds:  employeeDepartmentIds(emp),
    jobTitle:       String(emp.jobTitle?.id ?? ''),
    employmentType: emp.employmentType ?? '',
    salary:         String(emp.salary ?? ''),
    workingHours:   String(emp.workingHours ?? 8),
    managerId:      String(emp.manager?.id ?? 'none'),
  };
}

export function useEditEmployeeModal({ open, onClose, emp, isAr }: EditEmployeeModalProps) {
  const queryClient = useQueryClient();

  // Onboarding step 5 = submitted — step-specific POST endpoints are locked by the API
  const onboardingLocked = (emp.onboardingStep ?? 0) >= 5;

  const { register, control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: formDefaults(emp),
  });

  useEffect(() => {
    if (open) reset(formDefaults(emp));
  }, [open, emp, reset]);

  const { data: departments = [] }      = useDepartments();
  const selectedDeptIds                 = useWatch({ control, name: 'departmentIds' }) ?? [];
  const selectedJobTitle                = useWatch({ control, name: 'jobTitle' }) ?? '';
  const { data: allJobTitles = [], isLoading: titlesLoading } = useJobTitles();
  const { data: employmentTypes = [] }  = useEmploymentTypes();

  const selectedDeptSet = useMemo(
    () => new Set(selectedDeptIds.map(String)),
    [selectedDeptIds],
  );

  const filteredTitles = useMemo(() => {
    if (selectedDeptSet.size === 0) return [];
    return allJobTitles.filter((t) => {
      const deptId = titleDepartmentId(t);
      return !deptId || selectedDeptSet.has(deptId);
    });
  }, [allJobTitles, selectedDeptSet]);

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = filteredTitles.map((j) => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = employmentTypes.map((t) => ({ id: t.value, label: t.label }));
  const { items: managerItems } = useManagerOptions(isAr, emp.id);

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  function handleDepartmentsChange(departmentIds: string[], onChange: (ids: string[]) => void) {
    onChange(departmentIds);
    const nextSet = new Set(departmentIds.map(String));
    const title = allJobTitles.find((t) => String(t.id) === selectedJobTitle);
    const titleDept = title ? titleDepartmentId(title) : '';
    if (selectedJobTitle && titleDept && !nextSet.has(titleDept)) {
      setValue('jobTitle', '');
    }
  }

  function handleJobTitleChange(jobTitleId: string, onChange: (id: string) => void) {
    onChange(jobTitleId);
    const title = allJobTitles.find((t) => String(t.id) === jobTitleId);
    const deptFromTitle = title ? titleDepartmentId(title) : '';
    if (deptFromTitle && !selectedDeptSet.has(deptFromTitle)) {
      setValue('departmentIds', [...selectedDeptIds, deptFromTitle]);
    }
  }

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      employeeApi.update(emp.id, {
        name:            data.fullName,
        email:           data.email,
        phone:           data.phone,
        department_ids:  toDepartmentIds(data.departmentIds),
        job_title_id:    Number(data.jobTitle),
        manager_id:      data.managerId === 'none' ? null : data.managerId,
        /* Employment type / salary / schedule are locked once onboarding is submitted. */
        ...(onboardingLocked ? {} : {
          employment_type: data.employmentType as EmploymentType || undefined,
          salary:          parseFloat(data.salary) || undefined,
          working_hours:     Number(data.workingHours) || 8,
        }),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', emp.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      onClose();
    },

    onError: (err: unknown) => {
      const fieldErrors = extractApiFieldErrors(err);
      const deptErr = fieldErrors.departmentIds || fieldErrors.jobTitleId || fieldErrors.job_title_id;
      toast.error(deptErr || extractApiError(err) || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
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
    selectedDeptIds,
    titlesLoading,
    handleDepartmentsChange,
    handleJobTitleChange,
  };
}
