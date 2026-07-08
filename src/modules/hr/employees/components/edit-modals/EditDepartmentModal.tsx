import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Combobox }  from '@/shared/components/form/Combobox';
import { FormField } from '@/shared/components/form/FormField';
import { employeeApi } from '../../api/employee.api';
import { useDepartments } from '../../hooks/useLookups';
import type { ApiLookup } from '../../types/employee.types';

interface Props {
  open:       boolean;
  onClose:    () => void;
  employeeId: string;
  current:    ApiLookup | null | undefined;
  isAr:       boolean;
}

export function EditDepartmentModal({ open, onClose, employeeId, current, isAr }: Props) {
  const queryClient = useQueryClient();
  const { data: departments = [] } = useDepartments();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { department: current ? String(current.id) : '' },
  });

  useEffect(() => {
    if (open) reset({ department: current ? String(current.id) : '' });
  }, [open]);

  const mutation = useMutation({
    mutationFn: (department_id: number) =>
      employeeApi.update(employeeId, { department_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم نقل الموظف إلى القسم الجديد' : 'Department updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  const items   = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  function onSubmit(data: { department: string }) {
    if (!data.department || data.department === String(current?.id ?? '')) { onClose(); return; }
    mutation.mutate(Number(data.department));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'نقل الموظف لقسم آخر' : 'Transfer Department'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button isLoading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField label={isAr ? 'القسم' : 'Department'}>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Combobox items={items} value={field.value} onChange={field.onChange} {...cbProps} />
          )}
        />
      </FormField>
    </Modal>
  );
}
