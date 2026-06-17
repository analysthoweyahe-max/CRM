import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, X,
  BadgeDollarSign, CalendarDays, FileText, StickyNote, User, CircleCheck,
  ChevronDown, Search,
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

/* ─── Searchable employee combobox ───────────────── */
function EmployeeCombobox({ value, onChange, error, isAr }: {
  value:    string;
  onChange: (id: string) => void;
  error?:   boolean;
  isAr:     boolean;
}) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = EMPLOYEES.filter((e) => {
    const q = query.toLowerCase();
    return (
      e.name.includes(query) ||
      e.id.toLowerCase().includes(q) ||
      e.department.includes(query)
    );
  });

  const selected = EMPLOYEES.find((e) => e.id === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'w-full h-11 rounded-lg border px-4 text-sm text-start',
          'bg-white dark:bg-gray-700/50',
          'outline-none transition flex items-center justify-between gap-2',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
            : 'border-gray-200 dark:border-gray-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
        ].join(' ')}
      >
        {selected ? (
          <span className="text-gray-800 dark:text-gray-200 truncate">
            {selected.name}
            <span className="text-gray-400 dark:text-gray-500 ms-2 text-xs">{selected.department}</span>
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {isAr ? 'ابحث عن موظف...' : 'Search for an employee...'}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-800 shadow-xl z-50">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? 'ابحث باسم الموظف أو القسم...' : 'Search by name or department...'}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-gray-700/50 ps-9 pe-3
                           text-sm text-gray-800 dark:text-gray-200
                           outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20
                           transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <Search size={14} className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                {isAr ? 'لا نتائج' : 'No results'}
              </li>
            ) : (
              filtered.map((emp) => (
                <li
                  key={emp.id}
                  onMouseDown={() => { onChange(emp.id); setOpen(false); setQuery(''); }}
                  className={[
                    'flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors',
                    value === emp.id
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  ].join(' ')}
                >
                  <span>
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ms-2">{emp.id}</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{emp.department}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

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
          className="p-2 rounded-lg text-gray-400 dark:text-gray-500
                     hover:text-gray-700 dark:hover:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isAr ? 'رجوع' : 'Back'}
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'إضافة خصم' : 'Add Deduction'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isAr ? 'تسجيل خصم يدوي على موظف' : 'Register a manual deduction for an employee'}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ──
          DOM order: form first, aside second.
          LTR (flex-row): form LEFT, aside RIGHT.
          RTL (flex-row): first item appears on RIGHT, second on LEFT → form RIGHT, aside LEFT. ✓ */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 rounded-2xl border border-gray-100 dark:border-gray-700
                     bg-white dark:bg-gray-800 shadow-sm p-6 space-y-5"
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
                <EmployeeCombobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={!!errors.employeeId}
                  isAr={isAr}
                />
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
              label={isAr ? 'مبلغ الخصم' : 'Deduction Amount'}
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
              placeholder={isAr ? 'تفاصيل إضافية' : 'Additional details'}
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
                         border border-gray-200 dark:border-gray-600
                         text-gray-600 dark:text-gray-400
                         hover:bg-gray-50 dark:hover:bg-gray-700/50
                         text-sm font-medium transition-colors"
            >
              <X size={15} />
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </form>

        {/* ── Info panel ── */}
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                          bg-white dark:bg-gray-800 shadow-sm p-5 space-y-4">
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
          </div>
        </aside>

      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────── */
function inputCls(hasError: boolean) {
  return [
    'w-full h-11 rounded-lg border px-4 text-sm',
    'text-gray-800 dark:text-gray-200',
    'bg-white dark:bg-gray-700/50',
    'outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
      : 'border-gray-200 dark:border-gray-600 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
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
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
