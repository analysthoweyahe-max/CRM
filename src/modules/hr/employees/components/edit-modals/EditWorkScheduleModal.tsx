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
import type { EmploymentType, UpdateWorkSchedulePayload } from '../../types/employee.types';

interface Props {
  open:            boolean;
  onClose:         () => void;
  employeeId:      string;
  employmentType:  EmploymentType | null | undefined;
  currentStart:    string | null | undefined;
  currentEnd:      string | null | undefined;
  currentHours:    number | null | undefined;
  isAr:            boolean;
}

export function EditWorkScheduleModal({
  open, onClose, employeeId, employmentType, currentStart, currentEnd, currentHours, isAr,
}: Props) {
  const queryClient = useQueryClient();
  const isPartTime = employmentType === 'part_time';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      shiftStart:   currentStart ?? '',
      shiftEnd:     currentEnd   ?? '',
      workingHours: currentHours != null ? String(currentHours) : '',
    },
  });

  useEffect(() => {
    if (open) reset({
      shiftStart:   currentStart ?? '',
      shiftEnd:     currentEnd   ?? '',
      workingHours: currentHours != null ? String(currentHours) : '',
    });
  }, [open]);

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

  function onSubmit(data: { shiftStart: string; shiftEnd: string; workingHours: string }) {
    if (isPartTime) {
      const hours = Number(data.workingHours);
      if (!hours || hours <= 0) return;
      mutation.mutate({ working_hours: hours });
    } else {
      if (!data.shiftStart || !data.shiftEnd) return;
      mutation.mutate({ shift_start: data.shiftStart, shift_end: data.shiftEnd });
    }
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
        {isPartTime ? (
          <FormField label={isAr ? 'عدد ساعات العمل' : 'Working Hours'}>
            <Input {...register('workingHours')} type="number" min={1} endIcon={<Clock size={15} />} />
          </FormField>
        ) : (
          <>
            <FormField label={isAr ? 'وقت بداية الدوام' : 'Shift Start'}>
              <Input {...register('shiftStart')} type="time" endIcon={<Clock size={15} />} />
            </FormField>
            <FormField label={isAr ? 'وقت نهاية الدوام' : 'Shift End'}>
              <Input {...register('shiftEnd')} type="time" endIcon={<Clock size={15} />} />
            </FormField>
          </>
        )}
      </div>
    </Modal>
  );
}
