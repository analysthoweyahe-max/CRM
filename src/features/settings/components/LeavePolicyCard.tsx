import { useForm }   from 'react-hook-form';
import { Check }     from 'lucide-react';
import { toast }     from 'sonner';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';

interface LeavePolicyValues {
  annualLeave:  number;
  sickLeave:    number;
  maxCarryover: number;
  notifyBefore: number;
}

export function LeavePolicyCard({ isAr }: { isAr: boolean }) {
  const { register, handleSubmit, formState: { isSubmitting } } =
    useForm<LeavePolicyValues>({
      defaultValues: { annualLeave: 15, sickLeave: 15, maxCarryover: 15, notifyBefore: 15 },
    });

  async function onSubmit(data: LeavePolicyValues) {
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await api.put('/settings/leave-policy', data)
    console.log('leave policy:', data);
    toast.success(isAr ? 'تم حفظ سياسة الإجازات' : 'Leave policy saved');
  }

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold" style={{ color: '#302F33' }}>
          {isAr ? 'سياسة الإجازات' : 'Leave Policy'}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#595959' }}>
          {isAr ? 'أرصدة الإجازات السنوية' : 'Annual leave balances'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label={isAr ? 'رصيد الإجازة السنوية' : 'Annual Leave'}>
            <Input
              {...register('annualLeave', { valueAsNumber: true })}
              type="number" min={0}
            />
          </FormField>

          <FormField label={isAr ? 'رصيد الإجازة المرضية' : 'Sick Leave'}>
            <Input
              {...register('sickLeave', { valueAsNumber: true })}
              type="number" min={0}
            />
          </FormField>

          <FormField label={isAr ? 'الحد الأقصى للترحيل' : 'Max Carryover'}>
            <Input
              {...register('maxCarryover', { valueAsNumber: true })}
              type="number" min={0}
            />
          </FormField>

          <FormField label={isAr ? 'إشعار قبل (أيام)' : 'Notify Before (days)'}>
            <Input
              {...register('notifyBefore', { valueAsNumber: true })}
              type="number" min={0}
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
