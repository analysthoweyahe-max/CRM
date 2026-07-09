import { useEffect } from 'react';
import { useForm }   from 'react-hook-form';
import { Clock, Check } from 'lucide-react';
import { toast }     from 'sonner';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';

interface AttendanceValues {
  daily_hours:    number;
  late_allowance: number;
  window_from:    string;
  window_to:      string;
}

export function AttendancePolicyCard({ isAr }: { isAr: boolean }) {
  const { data: settings }             = useSettings();
  const { mutateAsync: updateSetting } = useUpdateSetting();

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<AttendanceValues>({
      defaultValues: { daily_hours: 8, late_allowance: 15, window_from: '10:00', window_to: '12:00' },
    });

  useEffect(() => {
    if (!settings) return;
    reset({
      daily_hours:    Number(settings.daily_hours    ?? 8),
      late_allowance: Number(settings.late_allowance ?? 15),
      window_from:    String(settings.start_time     ?? '10:00').slice(0, 5),
      window_to:      String(settings.end_time       ?? '12:00').slice(0, 5),
    });
  }, [settings, reset]);

  async function onSubmit(data: AttendanceValues) {
    await Promise.all([
      updateSetting({ key: 'daily_hours',    value: data.daily_hours    }),
      updateSetting({ key: 'late_allowance', value: data.late_allowance }),
      updateSetting({ key: 'start_time',     value: data.window_from     }),
      updateSetting({ key: 'end_time',       value: data.window_to       }),
    ]);
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
        <FormField label={isAr ? 'نافذة البدء الطبيعي' : 'Normal Start Window'} icon={<Clock size={15} className="text-gray-400" />}>
          <div className="flex items-center gap-2">
            <Input {...register('window_from')} type="time" />
            <span className="text-gray-400 shrink-0">{isAr ? 'إلى' : 'to'}</span>
            <Input {...register('window_to')} type="time" />
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Work Hours'}>
            <Input {...register('daily_hours', { valueAsNumber: true })} type="number" min={1} max={24} />
          </FormField>

          <FormField label={isAr ? 'سماح التأخير (دقيقة)' : 'Late Allowance (min)'}>
            <Input {...register('late_allowance', { valueAsNumber: true })} type="number" min={0} />
          </FormField>
        </div>

        <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
