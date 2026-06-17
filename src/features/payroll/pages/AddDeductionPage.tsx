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

/* ─── Schema ─────────────────────────────────────── */
const schema = z.object({
  employeeId: z.string().min(1, 'يرجى اختيار الموظف'),
  date:       z.string().min(1, 'يرجى تحديد تاريخ الخصم'),
  amount:     z.string()
               .min(1, 'يرجى إدخال المبلغ')
               .refine((v) => Number(v) > 0, 'يجب أن يكون المبلغ أكبر من صفر'),
  reason:     z.string().min(3, 'يرجى إدخال سبب الخصم'),
  notes:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Employee list (replace with API) ──────────── */
const EMPLOYEES = [
  { id: 'EMP-001', name: 'حسن الخطيب',  department: 'الموارد البشرية'  },
  { id: 'EMP-002', name: 'سارة سعيد',   department: 'العمليات'         },
  { id: 'EMP-003', name: 'مريم سعيد',   department: 'خدمة العملاء'     },
  { id: 'EMP-004', name: 'رنا صبري',    department: 'المبيعات'         },
  { id: 'EMP-005', name: 'نور أحمد',    department: 'الموارد البشرية'  },
  { id: 'EMP-006', name: 'أحمد محمد',   department: 'المبيعات'         },
  { id: 'EMP-007', name: 'خالد العمري', department: 'تقنية المعلومات'  },
  { id: 'EMP-008', name: 'فاطمة علي',   department: 'المحاسبة'         },
];

const INFO_ITEMS = [
  'يتم إشعار الموظف تلقائياً عند تسجيل الخصم.',
  'يُحفظ سجل تدقيق لكل عملية خصم.',
  'لا يتم حذف الخصومات نهائياً للحفاظ على السجل.',
  'الخصومات التلقائية تُحسب من سجلات الحضور.',
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
    resolver: zodResolver(schema),
    defaultValues: { notes: '' },
  });

  async function onSubmit(values: FormValues) {
    await new Promise((r) => setTimeout(r, 700));
    console.log('Deduction payload:', values);
    toast.success(isAr ? 'تم حفظ الخصم بنجاح' : 'Deduction saved successfully');
    navigate(ROUTES.PAYROLL.DEDUCTIONS);
  }

  function goBack() {
    navigate(ROUTES.PAYROLL.DEDUCTIONS);
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={isAr ? 'رجوع' : 'Back'}
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAr ? 'إضافة خصم' : 'Add Deduction'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAr ? 'تسجيل خصم يدوي على موظف' : 'Register a manual deduction for an employee'}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col-reverse lg:flex-row gap-5">

        {/* ── Info panel ── */}
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">
              {isAr ? 'معلومات' : 'Information'}
            </h3>
            <ul className="space-y-3">
              {INFO_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CircleCheck size={16} className="text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5"
        >

          {/* Employee */}
          <Field
            label={isAr ? 'الموظف' : 'Employee'}
            required
            icon={<User size={15} className="text-gray-400" />}
            error={errors.employeeId?.message}
          >
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <select
                    {...field}
                    className={selectCls(!!errors.employeeId)}
                  >
                    <option value="">{isAr ? 'اختر الموظف' : 'Select employee'}</option>
                    {EMPLOYEES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.department}
                      </option>
                    ))}
                  </select>
                  <ArrowLeft
                    size={14}
                    className="absolute inset-y-0 my-auto inset-e-3 text-gray-400 pointer-events-none rotate-90"
                  />
                </div>
              )}
            />
          </Field>

          {/* Date + Amount row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Date */}
            <Field
              label={isAr ? 'تاريخ الخصم' : 'Deduction Date'}
              required
              icon={<CalendarDays size={15} className="text-gray-400" />}
              error={errors.date?.message}
            >
              <div className="relative">
                <input
                  {...register('date')}
                  type="month"
                  className={inputCls(!!errors.date)}
                />
                <CalendarDays
                  size={15}
                  className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none"
                />
              </div>
            </Field>

            {/* Amount */}
            <Field
              label={isAr ? 'مبلغ الخصم' : 'Amount'}
              required
              icon={<BadgeDollarSign size={15} className="text-gray-400" />}
              error={errors.amount?.message}
            >
              <div className="relative">
                <input
                  {...register('amount')}
                  type="number"
                  min="1"
                  placeholder="0"
                  className={`${inputCls(!!errors.amount)} text-end`}
                />
                <BadgeDollarSign
                  size={15}
                  className="absolute inset-y-0 my-auto inset-e-3 text-gray-400 pointer-events-none"
                />
              </div>
            </Field>

          </div>

          {/* Reason */}
          <Field
            label={isAr ? 'سبب الخصم' : 'Reason'}
            required
            icon={<FileText size={15} className="text-gray-400" />}
            error={errors.reason?.message}
          >
            <input
              {...register('reason')}
              type="text"
              placeholder={isAr ? 'مثال: غياب بدون إذن' : 'e.g. Absence without permission'}
              className={inputCls(!!errors.reason)}
            />
          </Field>

          {/* Notes */}
          <Field
            label={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            icon={<StickyNote size={15} className="text-gray-400" />}
          >
            <textarea
              {...register('notes')}
              rows={5}
              placeholder={isAr ? 'تفاصيل اضافية' : 'Additional details'}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

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
              onClick={goBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                         border border-gray-200 text-gray-600 hover:bg-gray-50
                         text-sm font-medium transition-colors"
            >
              <X size={15} />
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────── */
function inputCls(hasError: boolean) {
  return [
    'w-full h-11 rounded-lg border px-4 text-sm text-gray-800 bg-white',
    'outline-none transition placeholder:text-gray-400',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
  ].join(' ');
}

function selectCls(hasError: boolean) {
  return [
    inputCls(hasError),
    'appearance-none cursor-pointer pe-8',
  ].join(' ');
}

function Field({
  label, required = false, icon, error, children,
}: {
  label:     string;
  required?: boolean;
  icon?:     React.ReactNode;
  error?:    string;
  children:  React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
