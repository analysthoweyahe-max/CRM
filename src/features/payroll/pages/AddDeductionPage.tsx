import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, X,
  BadgeDollarSign, CalendarDays, FileText, StickyNote, User, CircleCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Card }      from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Input }     from '@/shared/components/ui/Input';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';

/* ─── Schema ─────────────────────────────────────── */
const makeSchema = (isAr: boolean) => z.object({
  employeeId: z.string().min(1, isAr ? 'يرجى اختيار الموظف' : 'Please select an employee'),
  date:       z.string().min(1, isAr ? 'يرجى تحديد تاريخ الخصم' : 'Please select a deduction date'),
  amount:     z.string()
               .min(1, isAr ? 'يرجى إدخال المبلغ' : 'Please enter an amount')
               .refine((v) => Number(v) > 0, isAr ? 'يجب أن يكون المبلغ أكبر من صفر' : 'Amount must be greater than zero'),
  reason:     z.string().min(3, isAr ? 'يرجى إدخال سبب الخصم (٣ أحرف على الأقل)' : 'Please enter a reason (min 3 chars)'),
  notes:      z.string().optional(),
});

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

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

const INFO_ITEMS = [
  {
    ar: 'يتم إشعار الموظف تلقائياً عند تسجيل الخصم.',
    en: 'The employee is automatically notified when a deduction is registered.',
  },
  {
    ar: 'يُحفظ سجل تدقيق لكل عملية خصم.',
    en: 'An audit log is saved for every deduction operation.',
  },
  {
    ar: 'لا يتم حذف الخصومات نهائياً للحفاظ على السجل.',
    en: 'Deductions are never permanently deleted to preserve the record.',
  },
  {
    ar: 'الخصومات التلقائية تُحسب من سجلات الحضور.',
    en: 'Automatic deductions are calculated from attendance records.',
  },
];

/* ─── Component ──────────────────────────────────── */
export function AddDeductionPage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: (values, context, options) =>
      zodResolver(makeSchema(isAr))(values, context, options),
    defaultValues: { notes: '' },
  });

  async function onSubmit(values: FormValues) {
    await new Promise((r) => setTimeout(r, 700));
    console.log('Deduction payload:', values);
    toast.success(isAr ? 'تم حفظ الخصم بنجاح' : 'Deduction saved successfully');
    navigate(ROUTES.PAYROLL.DEDUCTIONS);
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إضافة خصم' : 'Add Deduction'}
        subtitle={isAr ? 'تسجيل خصم يدوي على موظف' : 'Register a manual deduction for an employee'}
        start={
          <button
            type="button"
            onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS)}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500
                       hover:text-gray-700 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </button>
        }
      />

      {/* Two-column: form first (LEFT in LTR / RIGHT in RTL), aside second (RIGHT in LTR / LEFT in RTL) */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1"
        >
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

            {/* Date + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label={isAr ? 'تاريخ الخصم' : 'Deduction Date'}
                required
                icon={<CalendarDays size={15} className="text-gray-400" />}
                error={errors.date?.message}
              >
                <Input
                  {...register('date')}
                  type="month"
                  hasError={!!errors.date}
                  startIcon={<CalendarDays size={15} />}
                />
              </FormField>

              <FormField
                label={isAr ? 'مبلغ الخصم' : 'Deduction Amount'}
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
                  className="text-end"
                />
              </FormField>
            </div>

            {/* Reason */}
            <FormField
              label={isAr ? 'سبب الخصم' : 'Reason'}
              required
              icon={<FileText size={15} className="text-gray-400" />}
              error={errors.reason?.message}
            >
              <Input
                {...register('reason')}
                type="text"
                placeholder={isAr ? 'مثال: غياب بدون إذن' : 'e.g. Absence without permission'}
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
                placeholder={isAr ? 'تفاصيل إضافية' : 'Additional details'}
                className={`${inputCls(false)} resize-none`}
              />
            </FormField>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white
                           text-sm font-semibold transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check size={16} />
                {isSubmitting
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                  : (isAr ? 'حفظ الخصم' : 'Save Deduction')}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS)}
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

        {/* Info panel */}
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
