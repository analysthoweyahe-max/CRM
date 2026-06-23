import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, X,
  BadgeDollarSign, CalendarDays, FileText, StickyNote, User, CircleCheck, Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { Card }        from '@/shared/components/ui/Card';
import { PageHeader }  from '@/shared/components/ui/PageHeader';
import { Button }      from '@/shared/components/ui/Button';
import { Input }       from '@/shared/components/ui/Input';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }    from '@/shared/components/form/Combobox';
import { makeBonusSchema }     from '../schemas/addBonus.schema';
import type { AddBonusFormValues } from '../types/addBonus.types';

/* ─── Data ───────────────────────────────────────── */
const EMPLOYEE_ITEMS = [
  { id: 'EMP-001', label: 'حسن الخطيب',  detail: 'EMP-001', meta: 'الموارد البشرية'  },
  { id: 'EMP-002', label: 'سارة سعيد',   detail: 'EMP-002', meta: 'العمليات'         },
  { id: 'EMP-003', label: 'مريم سعيد',   detail: 'EMP-003', meta: 'خدمة العملاء'     },
  { id: 'EMP-004', label: 'رنا صبري',    detail: 'EMP-004', meta: 'المبيعات'         },
  { id: 'EMP-005', label: 'نور أحمد',    detail: 'EMP-005', meta: 'الموارد البشرية'  },
  { id: 'EMP-006', label: 'أحمد محمد',   detail: 'EMP-006', meta: 'المبيعات'         },
  { id: 'EMP-007', label: 'خالد العمري', detail: 'EMP-007', meta: 'تقنية المعلومات'  },
  { id: 'EMP-008', label: 'فاطمة علي',   detail: 'EMP-008', meta: 'المحاسبة'         },
];

const BONUS_TYPE_ITEMS = [
  { id: 'performance', label: 'مكافأة أداء',  detail: '', meta: '' },
  { id: 'overtime',    label: 'ساعات إضافية', detail: '', meta: '' },
  { id: 'manual',      label: 'مكافأة يدوية', detail: '', meta: '' },
];

const INFO_ITEMS = [
  {
    ar: 'يتم إشعار الموظف تلقائياً بعد إضافة المكافأة.',
    en: 'The employee is automatically notified after adding the bonus.',
  },
  {
    ar: 'تظهر المكافأة في السجل المالي للموظف.',
    en: 'The bonus appears in the employee\'s financial record.',
  },
  {
    ar: 'تُضاف المكافأة إلى صافي راتب الشهر المحدد.',
    en: 'The bonus is added to the net salary of the selected month.',
  },
];

/* ─── Component ──────────────────────────────────── */
export function AddBonusPage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddBonusFormValues>({
    resolver: (values, context, options) =>
      zodResolver(makeBonusSchema(isAr))(values, context, options),
    defaultValues: { notes: '' },
  });

  async function onSubmit(values: AddBonusFormValues) {
    await new Promise((r) => setTimeout(r, 700));
    console.log('Bonus payload:', values);
    toast.success(isAr ? 'تم حفظ المكافأة بنجاح' : 'Bonus saved successfully');
    navigate(ROUTES.PAYROLL.BONUSES);
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إضافة مكافأة' : 'Add Bonus'}
        subtitle={isAr ? 'منح مكافأة أو حافز لموظف' : 'Grant a bonus or incentive to an employee'}
        start={
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate(ROUTES.PAYROLL.BONUSES)}
            className="p-2"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Form — first in HTML → RIGHT in RTL */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1">
          <Card padding="lg" className="space-y-5">

            {/* Employee */}
            <FormField
              label={isAr ? 'الموظف' : 'Employee'}
              required
              icon={<User size={15} className="text-gray-400" />}
              error={errors.employeeId?.message}
            >
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={EMPLOYEE_ITEMS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.employeeId}
                    placeholder={isAr ? 'ابحث عن موظف...' : 'Search for an employee...'}
                    searchPlaceholder={isAr ? 'ابحث باسم الموظف أو القسم...' : 'Search by name or department...'}
                    noResultsText={isAr ? 'لا نتائج' : 'No results'}
                  />
                )}
              />
            </FormField>

            {/* Type + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label={isAr ? 'نوع المكافأة' : 'Bonus Type'}
                required
                icon={<Gift size={15} className="text-gray-400" />}
                error={errors.type?.message}
              >
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={BONUS_TYPE_ITEMS}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      error={!!errors.type}
                      placeholder={isAr ? 'اختر نوع المكافأة...' : 'Select bonus type...'}
                      searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                      noResultsText={isAr ? 'لا نتائج' : 'No results'}
                    />
                  )}
                />
              </FormField>

              <FormField
                label={isAr ? 'مبلغ المكافأة' : 'Bonus Amount'}
                required
                icon={<BadgeDollarSign size={15} className="text-gray-400" />}
                error={errors.amount?.message}
              >
                <Input
                  {...register('amount')}
                  type="number"
                  min="1"
                  placeholder="0"
                  hasError={!!errors.amount}
                  endIcon={<BadgeDollarSign size={15} />}
                />
              </FormField>
            </div>

            {/* Financial Period */}
            <FormField
              label={isAr ? 'الفترة المالية' : 'Financial Period'}
              required
              icon={<CalendarDays size={15} className="text-gray-400" />}
              error={errors.date?.message}
            >
              <Input
                {...register('date')}
                type="month"
                hasError={!!errors.date}
              />
            </FormField>

            {/* Reason */}
            <FormField
              label={isAr ? 'سبب المكافأة' : 'Reason'}
              required
              icon={<FileText size={15} className="text-gray-400" />}
              error={errors.reason?.message}
            >
              <Input
                {...register('reason')}
                type="text"
                placeholder={isAr ? 'مثال: تقييم أداء ممتاز' : 'e.g. Outstanding performance review'}
                hasError={!!errors.reason}
              />
            </FormField>

            {/* Notes */}
            <FormField
              label={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
              icon={<StickyNote size={15} className="text-gray-400" />}
            >
              <textarea
                {...register('notes')}
                rows={5}
                placeholder={isAr ? 'تفاصيل اضافية' : 'Additional details'}
                className={`${inputCls(false)} resize-none`}
              />
            </FormField>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-[#A0CD39] hover:bg-[#90BA33] active:bg-[#83AA2F] text-gray-900
                           text-sm font-semibold transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check size={16} />
                {isSubmitting
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                  : (isAr ? 'حفظ المكافأة' : 'Save Bonus')}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PAYROLL.BONUSES)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           border border-gray-200 dark:border-gray-600
                           text-gray-600 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-gray-700/50
                           text-sm font-medium transition-colors"
              >
                <X size={15} />
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>

          </Card>
        </form>

        {/* Info panel — second in HTML → LEFT in RTL */}
        <aside className="lg:w-64 shrink-0">
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {isAr ? 'معلومات' : 'Information'}
            </h3>
            <ul className="space-y-3">
              {INFO_ITEMS.map((item, i) => (
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
