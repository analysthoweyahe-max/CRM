import { ArrowRight, ArrowLeft, Check, X, CircleCheck } from 'lucide-react';
import { useNavigate }     from 'react-router-dom';
import { ROUTES }          from '@/app/router/routes';
import { Card }            from '@/shared/components/ui/Card';
import { PageHeader }      from '@/shared/components/ui/PageHeader';
import { Button }          from '@/shared/components/ui/Button';
import { BonusFormFields } from '../components/BonusFormFields';
import { useAddBonusPage } from '../hooks/useAddBonusPage';

const INFO = [
  { ar: 'يتم إشعار الموظف تلقائياً بعد إضافة المكافأة.',   en: 'The employee is automatically notified after adding the bonus.'  },
  { ar: 'تظهر المكافأة في السجل المالي للموظف.',             en: "The bonus appears in the employee's financial record."           },
  { ar: 'تُضاف المكافأة إلى صافي راتب الشهر المحدد.',        en: 'The bonus is added to the net salary of the selected month.'    },
];

export function AddBonusPage() {
  const navigate = useNavigate();
  const { isAr, isRTL, form, empItems, typeItems, monthItems, onSubmit } = useAddBonusPage();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = form;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إضافة مكافأة' : 'Add Bonus'}
        subtitle={isAr ? 'منح مكافأة أو حافز لموظف' : 'Grant a bonus or incentive to an employee'}
        start={
          <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.PAYROLL.BONUSES)}
            className="p-2" aria-label={isAr ? 'رجوع' : 'Back'}>
            <BackIcon size={18} />
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1">
          <Card padding="lg" className="space-y-5">
            <BonusFormFields
              register={register} control={control} errors={errors}
              empItems={empItems} typeItems={typeItems} monthItems={monthItems} isAr={isAr}
            />
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={16} />}>
                {isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ المكافأة' : 'Save Bonus')}
              </Button>
              <Button type="button" variant="secondary" startIcon={<X size={15} />}
                onClick={() => navigate(ROUTES.PAYROLL.BONUSES)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </Card>
        </form>

        <aside className="lg:w-64 shrink-0">
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {isAr ? 'معلومات' : 'Information'}
            </h3>
            <ul className="space-y-3">
              {INFO.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CircleCheck size={16} className="text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {isAr ? item.ar : item.en}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

    </div>
  );
}
