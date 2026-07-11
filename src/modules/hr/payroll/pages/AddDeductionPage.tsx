import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, X, CircleCheck } from 'lucide-react';
import { toast }            from 'sonner';
import { useQuery }         from '@tanstack/react-query';
import { useLang }          from '@/app/providers/LanguageProvider';
import { ROUTES }           from '@/app/router/routes';
import { Card }             from '@/shared/components/ui/Card';
import { PageHeader }       from '@/shared/components/ui/PageHeader';
import { employeeApi }      from '@/modules/hr/employees/api/employee.api';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import { makeDeductionSchema } from '../schemas/addDeduction.schema';
import { useDeductionTypes, useCreateDeduction } from '../hooks/useDeductions';
import { payrollLookupLabel, payrollLookupSelectId } from '../utils/payrollType.utils';
import { DeductionFormFields } from '../components/DeductionFormFields';
import type { AddDeductionFormValues } from '../types/addDeduction.types';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

const INFO = [
  { ar: 'يتم إشعار الموظف تلقائياً عند تسجيل الخصم.',     en: 'The employee is automatically notified when a deduction is registered.' },
  { ar: 'يُحفظ سجل تدقيق لكل عملية خصم.',                  en: 'An audit log is saved for every deduction operation.' },
  { ar: 'لا يتم حذف الخصومات نهائياً للحفاظ على السجل.',   en: 'Deductions are never permanently deleted to preserve the record.' },
  { ar: 'الخصومات التلقائية تُحسب من سجلات الحضور.',        en: 'Automatic deductions are calculated from attendance records.' },
];

function buildMonthItems(isAr: boolean): ComboboxItem[] {
  const items: ComboboxItem[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    items.push({ id: val, label: d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }) });
  }
  return items;
}

export function AddDeductionPage() {
  const { lang, isRTL } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { data: typesRaw } = useDeductionTypes();
  const { data: empList  } = useQuery({
    queryKey: ['employees', 'list-all'],
    queryFn:  () => employeeApi.list({ per_page: 100 }).then((r) => r.data.data.data),
  });

  const typeItems = useMemo<ComboboxItem[]>(() =>
    (typesRaw ?? []).map((t) => ({
      id:    payrollLookupSelectId(t),
      label: payrollLookupLabel(t, isAr),
    })),
  [typesRaw, isAr]);

  const empItems = useMemo<ComboboxItem[]>(() =>
    (empList ?? []).map((e) => ({ id: e.employeeNumber ?? e.id, label: e.name })),
  [empList]);

  const monthItems = useMemo(() => buildMonthItems(isAr), [isAr]);
  const createDeduction = useCreateDeduction();

  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<AddDeductionFormValues>({
      resolver: (v, c, o) => zodResolver(makeDeductionSchema(isAr))(v, c, o),
      defaultValues: { notes: '', deduction_type_id: '' },
    });

  async function onSubmit(values: AddDeductionFormValues) {
    try {
      await createDeduction.mutateAsync({
        employee_number:    values.employee_id,
        deduction_type_id:  values.deduction_type_id,
        financial_month:    values.financial_month,
        amount:             Number(values.amount),
        reason:             values.reason,
        notes:              values.notes || undefined,
      });
      toast.success(isAr ? 'تم حفظ الخصم بنجاح' : 'Deduction saved successfully');
      navigate(ROUTES.PAYROLL.DEDUCTIONS);
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      let mapped = false;
      for (const [key, message] of Object.entries(fieldErrors)) {
        if (key === 'deduction_type_id' || key === 'deduction_type') {
          setError('deduction_type_id', { message });
          mapped = true;
        } else if (key === 'employee_number') {
          setError('employee_id', { message });
          mapped = true;
        } else if (key in values) {
          setError(key as keyof AddDeductionFormValues, { message });
          mapped = true;
        }
      }
      if (!mapped) toast.error(extractApiError(err));
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'إضافة خصم' : 'Add Deduction'}
        subtitle={isAr ? 'تسجيل خصم يدوي على موظف' : 'Register a manual deduction for an employee'}
        start={
          <button type="button" onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isAr ? 'رجوع' : 'Back'}>
            <BackIcon size={18} />
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1">
          <Card padding="lg" className="space-y-5">
            <DeductionFormFields
              register={register} control={control} errors={errors}
              empItems={empItems} typeItems={typeItems} monthItems={monthItems} isAr={isAr}
            />
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isSubmitting || createDeduction.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-[#A0CD39] hover:bg-[#90BA33] text-gray-900 text-sm font-semibold
                           transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <Check size={16} />
                {isSubmitting || createDeduction.isPending
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                  : (isAr ? 'حفظ الخصم' : 'Save Deduction')}
              </button>
              <button type="button" onClick={() => navigate(ROUTES.PAYROLL.DEDUCTIONS)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border
                           border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium transition-colors">
                <X size={15} />
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
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
