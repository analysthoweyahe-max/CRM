import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { employeeApi } from '../../api/employee.api';

interface Props {
  open:       boolean;
  onClose:    () => void;
  employeeId: string;
  current:    number | null | undefined;
  isAr:       boolean;
}

export function EditSalaryModal({ open, onClose, employeeId, current, isAr }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { salary: String(current ?? '') },
  });

  useEffect(() => {
    if (open) reset({ salary: String(current ?? '') });
  }, [open]);

  const mutation = useMutation({
    mutationFn: (salary: number) => employeeApi.updateSalary(employeeId, { salary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث الراتب' : 'Salary updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  function onSubmit(data: { salary: string }) {
    const salary = parseFloat(data.salary);
    if (!salary || salary <= 0) return;
    if (salary === (current ?? 0)) { onClose(); return; }
    mutation.mutate(salary);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل الراتب الأساسي' : 'Edit Basic Salary'}
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
      <FormField label={isAr ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)'}>
        <Input
          {...register('salary')}
          type="number"
          min={0}
          endIcon={<DollarSign size={15} />}
          placeholder="0"
        />
      </FormField>
    </Modal>
  );
}
