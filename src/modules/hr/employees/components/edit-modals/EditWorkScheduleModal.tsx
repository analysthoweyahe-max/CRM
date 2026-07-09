import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { employeeApi } from '../../api/employee.api';
import type { UpdateWorkSchedulePayload } from '../../types/employee.types';

interface Props {
  open:            boolean;
  onClose:         () => void;
  employeeId:      string;
  currentHours:    number | null | undefined;
  isAr:            boolean;
}

export function EditWorkScheduleModal({
  open, onClose, employeeId, currentHours, isAr,
}: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      workingHours: currentHours != null ? String(currentHours) : '8',
    },
  });

  useEffect(() => {
    if (open) reset({
      workingHours: currentHours != null ? String(currentHours) : '8',
    });
  }, [open, currentHours, reset]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateWorkSchedulePayload) =>
      employeeApi.updateWorkSchedule(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث جدول الدوام' : 'Work schedule updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  function onSubmit(data: { workingHours: string }) {
    const hours = Number(data.workingHours);
    if (!hours || hours <= 0) return;
    mutation.mutate({ working_hours: hours });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل جدول الدوام' : 'Edit Work Schedule'}
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
      <FormField label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Working Hours'}>
        <Input {...register('workingHours')} type="number" min={1} endIcon={<Clock size={15} />} />
      </FormField>
    </Modal>
  );
}
