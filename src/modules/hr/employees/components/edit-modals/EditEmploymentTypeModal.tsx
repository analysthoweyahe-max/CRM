import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Combobox }  from '@/shared/components/form/Combobox';
import { FormField } from '@/shared/components/form/FormField';
import { employeeApi } from '../../api/employee.api';
import { JOB_TYPES }   from '../NewEmployeeForm/newEmployeeForm.types';
import type { EmploymentType } from '../../types/employee.types';

interface Props {
  open:       boolean;
  onClose:    () => void;
  employeeId: string;
  current:    EmploymentType | null | undefined;
  isAr:       boolean;
}

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

export function EditEmploymentTypeModal({ open, onClose, employeeId, current, isAr }: Props) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { employmentType: apiTypeToForm(current) },
  });

  useEffect(() => {
    if (open) reset({ employmentType: apiTypeToForm(current) });
  }, [open]);

  const mutation = useMutation({
    mutationFn: (employment_type: EmploymentType) =>
      employeeApi.updateEmploymentType(employeeId, { employment_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث نوع التوظيف' : 'Employment type updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  const items   = JOB_TYPES.map((t) => ({ id: t.id, label: isAr ? t.labelAr : t.labelEn }));
  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  function onSubmit(data: { employmentType: string }) {
    if (data.employmentType === apiTypeToForm(current)) { onClose(); return; }
    mutation.mutate(mapJobType(data.employmentType));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل نوع التوظيف' : 'Edit Employment Type'}
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
      <FormField label={isAr ? 'نوع التوظيف' : 'Employment Type'}>
        <Controller
          name="employmentType"
          control={control}
          render={({ field }) => (
            <Combobox items={items} value={field.value} onChange={field.onChange} {...cbProps} />
          )}
        />
      </FormField>
    </Modal>
  );
}
