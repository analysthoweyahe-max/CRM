import { useEffect } from 'react';
import { useForm }   from 'react-hook-form';
import { Check }     from 'lucide-react';
import { toast }     from 'sonner';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';

interface LeavePolicyValues {
  annual_leave:  number;
  sick_leave:    number;
  max_carryover: number;
  notify_before: number;
}

export function LeavePolicyCard({ isAr }: { isAr: boolean }) {
  const { data: settings }             = useSettings();
  const { mutateAsync: updateSetting } = useUpdateSetting();

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<LeavePolicyValues>({ defaultValues: { annual_leave: 15, sick_leave: 15, max_carryover: 15, notify_before: 1 } });

  useEffect(() => {
    if (!settings) return;
    reset({
      annual_leave:  Number(settings.annual_leave  ?? 15),
      sick_leave:    Number(settings.sick_leave    ?? 15),
      max_carryover: Number(settings.max_carryover ?? 15),
      notify_before: Number(settings.notify_before ?? 1),
    });
  }, [settings, reset]);

  async function onSubmit(data: LeavePolicyValues) {
    await Promise.all([
      updateSetting({ key: 'annual_leave',  value: data.annual_leave  }),
      updateSetting({ key: 'sick_leave',    value: data.sick_leave    }),
      updateSetting({ key: 'max_carryover', value: data.max_carryover }),
      updateSetting({ key: 'notify_before', value: data.notify_before }),
    ]);
    toast.success(isAr ? 'تم حفظ سياسة الإجازات' : 'Leave policy saved');
  }

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'سياسة الإجازات' : 'Leave Policy'}
        </h2>
        <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
          {isAr ? 'أرصدة الإجازات السنوية' : 'Annual leave balances'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'رصيد الإجازة السنوية' : 'Annual Leave'}>
            <Input {...register('annual_leave', { valueAsNumber: true })} type="number" min={0} />
          </FormField>

          <FormField label={isAr ? 'رصيد الإجازة المرضية' : 'Sick Leave'}>
            <Input {...register('sick_leave', { valueAsNumber: true })} type="number" min={0} />
          </FormField>

          <FormField label={isAr ? 'الحد الأقصى للترحيل' : 'Max Carryover'}>
            <Input {...register('max_carryover', { valueAsNumber: true })} type="number" min={0} />
          </FormField>

          <FormField label={isAr ? 'إشعار قبل (أيام)' : 'Notify Before (days)'}>
            <Input {...register('notify_before', { valueAsNumber: true })} type="number" min={0} />
          </FormField>
        </div>

        <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
