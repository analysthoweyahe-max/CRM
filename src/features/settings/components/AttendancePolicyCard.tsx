import { useForm }   from 'react-hook-form';
import { Clock, Check } from 'lucide-react';
import { toast }     from 'sonner';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';

interface AttendanceValues {
  dailyHours:    number;
  lateAllowance: number;
  startTime:     string;
  endTime:       string;
}

export function AttendancePolicyCard({ isAr }: { isAr: boolean }) {
  const { register, handleSubmit, formState: { isSubmitting } } =
    useForm<AttendanceValues>({
      defaultValues: { dailyHours: 8, lateAllowance: 15, startTime: '09:00', endTime: '17:00' },
    });

  async function onSubmit(data: AttendanceValues) {
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await api.put('/settings/attendance', data)
    console.log('attendance:', data);
    toast.success(isAr ? 'تم حفظ سياسة الحضور' : 'Attendance policy saved');
  }

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'سياسة الحضور' : 'Attendance Policy'}
        </h2>
        <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
          {isAr ? 'إعدادات احتساب الحضور' : 'Attendance calculation settings'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label={isAr ? 'ساعات العمل اليومية' : 'Daily Work Hours'}>
            <Input
              {...register('dailyHours', { valueAsNumber: true })}
              type="number" min={1} max={24}
            />
          </FormField>

          <FormField label={isAr ? 'سماح التأخير (دقيقة)' : 'Late Allowance (min)'}>
            <Input
              {...register('lateAllowance', { valueAsNumber: true })}
              type="number" min={0}
            />
          </FormField>

          <FormField
            label={isAr ? 'وقت بدء الدوام' : 'Work Start Time'}
            icon={<Clock size={15} className="text-gray-400" />}
          >
            <Input
              {...register('startTime')}
              type="time"
              endIcon={<Clock size={15} />}
            />
          </FormField>

          <FormField
            label={isAr ? 'وقت انتهاء الدوام' : 'Work End Time'}
            icon={<Clock size={15} className="text-gray-400" />}
          >
            <Input
              {...register('endTime')}
              type="time"
              endIcon={<Clock size={15} />}
            />
          </FormField>
        </div>

        <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
