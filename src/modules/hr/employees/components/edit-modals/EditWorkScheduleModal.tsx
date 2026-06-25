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

interface Props {
  open:         boolean;
  onClose:      () => void;
  employeeId:   string;
  currentStart: string | null | undefined;
  currentEnd:   string | null | undefined;
  isAr:         boolean;
}

export function EditWorkScheduleModal({ open, onClose, employeeId, currentStart, currentEnd, isAr }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { shiftStart: currentStart ?? '', shiftEnd: currentEnd ?? '' },
  });

  useEffect(() => {
    if (open) reset({ shiftStart: currentStart ?? '', shiftEnd: currentEnd ?? '' });
  }, [open]);

  const mutation = useMutation({
    mutationFn: (data: { shift_start: string; shift_end: string }) =>
      employeeApi.updateWorkSchedule(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث جدول الدوام' : 'Work schedule updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  function onSubmit(data: { shiftStart: string; shiftEnd: string }) {
    if (!data.shiftStart || !data.shiftEnd) return;
    mutation.mutate({ shift_start: data.shiftStart, shift_end: data.shiftEnd });
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
      <div className="space-y-4">
        <FormField label={isAr ? 'وقت بداية الدوام' : 'Shift Start'}>
          <Input {...register('shiftStart')} type="time" endIcon={<Clock size={15} />} />
        </FormField>
        <FormField label={isAr ? 'وقت نهاية الدوام' : 'Shift End'}>
          <Input {...register('shiftEnd')} type="time" endIcon={<Clock size={15} />} />
        </FormField>
      </div>
    </Modal>
  );
}
