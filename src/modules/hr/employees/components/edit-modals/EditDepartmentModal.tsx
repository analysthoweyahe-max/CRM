import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { employeeApi } from '../../api/employee.api';
import { useDepartments } from '../../hooks/useLookups';
import {
  employeeDepartmentIds,
  toDepartmentIds,
  type ApiEmployee,
} from '../../types/employee.types';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';

interface Props {
  open:       boolean;
  onClose:    () => void;
  employeeId: string;
  employee:   Pick<ApiEmployee, 'department' | 'departments'>;
  isAr:       boolean;
}

export function EditDepartmentModal({ open, onClose, employeeId, employee, isAr }: Props) {
  const queryClient = useQueryClient();
  const { data: departments = [] } = useDepartments();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { departmentIds: employeeDepartmentIds(employee) },
  });

  const selectedIds = watch('departmentIds') ?? [];

  useEffect(() => {
    if (open) reset({ departmentIds: employeeDepartmentIds(employee) });
  }, [open, employee, reset]);

  const mutation = useMutation({
    mutationFn: (department_ids: number[]) =>
      employeeApi.update(employeeId, { department_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث أقسام الموظف' : 'Departments updated');
      onClose();
    },
    onError: (err: unknown) => {
      const fieldErrors = extractApiFieldErrors(err);
      toast.error(
        fieldErrors.departmentIds
          || extractApiError(err)
          || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
      );
    },
  });

  const items   = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  function onSubmit(data: { departmentIds: string[] }) {
    if (!data.departmentIds.length) return;
    mutation.mutate(toDepartmentIds(data.departmentIds));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل الأقسام' : 'Edit Departments'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            isLoading={mutation.isPending}
            disabled={selectedIds.length === 0}
            onClick={handleSubmit(onSubmit)}
          >
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField
        label={isAr ? 'الأقسام' : 'Departments'}
        required
        error={selectedIds.length === 0 ? (isAr ? 'اختر قسماً واحداً على الأقل' : 'Select at least one department') : undefined}
      >
        <Controller
          name="departmentIds"
          control={control}
          render={({ field }) => (
            <MultiCombobox
              items={items}
              values={field.value ?? []}
              onChange={field.onChange}
              error={selectedIds.length === 0}
              placeholder={isAr ? 'اختر قسماً أو أكثر' : 'Select one or more departments'}
              {...cbProps}
            />
          )}
        />
      </FormField>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        {isAr
          ? 'القسم الأول في القائمة هو القسم الأساسي.'
          : 'The first selected department is the primary department.'}
      </p>
    </Modal>
  );
}
