import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, CalendarDays, Wallet, Clock, Info } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { NavButtons } from './StepWizard';
import {
  makeAllDataSchema,
  MANAGERS, JOB_TYPES, CURRENCIES,
  type AllDataValues,
} from './newEmployeeForm.types';
import { useDepartments, useJobTitles } from '../../hooks/useLookups';

interface Step1Props {
  isAr:           boolean;
  isRTL:          boolean;
  defaultValues?: Partial<AllDataValues>;
  onNext:         (d: AllDataValues) => void;
  onBack:         () => void;
}

export function Step1BasicData({ isAr, isRTL, defaultValues, onNext, onBack }: Step1Props) {
  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<AllDataValues>({
    resolver: (v, c, o) => zodResolver(makeAllDataSchema(isAr))(v, c, o),
    defaultValues: { managerId: 'none', startTime: '09:00', endTime: '17:00', currency: 'EGP', ...defaultValues },
  });

  const selectedDept = watch('department');
  const jobType      = watch('jobType');

  // Reset job title when department changes
  useEffect(() => {
    setValue('jobTitle', '');
  }, [selectedDept, setValue]);

  // Lookups from API
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: jobTitles   = [], isLoading: titlesLoading } = useJobTitles(selectedDept || undefined);

  const deptItems  = departments.map((d) => ({
    id:    String(d.id),
    label: isAr ? (d.nameAr || d.name) : d.name,
  }));

  const titleItems = jobTitles.map((t) => ({
    id:    String(t.id),
    label: isAr ? (t.nameAr || t.name) : t.name,
  }));

  const salaryLabel = jobType === 'part-time'
    ? (isAr ? 'الراتب بالساعة (ج.م)'     : 'Hourly Rate (EGP)')
    : jobType === 'freelance'
    ? (isAr ? 'الأتعاب لكل مشروع (ج.م)' : 'Project Fee (EGP)')
    : (isAr ? 'الراتب الشهري (ج.م)'      : 'Monthly Salary (EGP)');

  const jobTypeItems = JOB_TYPES.map((t) => ({ id: t.id, label: isAr ? t.labelAr : t.labelEn }));

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-6">

        {/* ── البيانات الأساسية ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'البيانات الأساسية' : 'Basic Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required error={errors.fullName?.message}>
              <Input {...register('fullName')}
                placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                hasError={!!errors.fullName} endIcon={<User size={15} />} />
            </FormField>

            <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required error={errors.email?.message}>
              <Input {...register('email')} type="email" placeholder="name@company.com"
                hasError={!!errors.email} endIcon={<Mail size={15} />} />
            </FormField>

            <FormField label={isAr ? 'رقم الهاتف' : 'Phone Number'} required error={errors.phone?.message}>
              <Input {...register('phone')} type="tel" placeholder="01xxxxxxxx"
                dir={isAr ? 'rtl' : 'ltr'}
                hasError={!!errors.phone} endIcon={<Phone size={15} />} />
            </FormField>

            <FormField label={isAr ? 'القسم' : 'Department'} required error={errors.department?.message}>
              <Controller name="department" control={control} render={({ field }) => (
                <Combobox
                  items={deptItems}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={!!errors.department}
                  placeholder={deptsLoading
                    ? (isAr ? 'جاري التحميل...' : 'Loading...')
                    : (isAr ? 'اختر قسم' : 'Select department')}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required error={errors.jobTitle?.message}>
              <Controller name="jobTitle" control={control} render={({ field }) => (
                <Combobox
                  items={titleItems}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={!!errors.jobTitle}
                  placeholder={
                    !selectedDept
                      ? (isAr ? 'اختر القسم أولاً' : 'Select department first')
                      : titlesLoading
                      ? (isAr ? 'جاري التحميل...' : 'Loading...')
                      : (isAr ? 'اختر المسمى' : 'Select title')
                  }
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>

            <FormField label={isAr ? 'تاريخ الالتحاق' : 'Hire Date'} required error={errors.hireDate?.message}>
              <Input {...register('hireDate')} type="date"
                hasError={!!errors.hireDate} endIcon={<CalendarDays size={15} />} />
            </FormField>

            <FormField label={isAr ? 'المدير المباشر (اختياري)' : 'Direct Manager (optional)'}>
              <Controller name="managerId" control={control} render={({ field }) => (
                <Combobox items={MANAGERS} value={field.value ?? 'none'} onChange={field.onChange}
                  placeholder={isAr ? 'بدون مدير مباشر' : 'No direct manager'}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>
          </div>
        </div>

        {/* ── معلومات الدوام ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'معلومات الدوام' : 'Work Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={isAr ? 'نوع التوظيف المناسب للموظف' : 'Employment Type'} required error={errors.jobType?.message}>
              <Controller name="jobType" control={control} render={({ field }) => (
                <Combobox items={jobTypeItems} value={field.value ?? ''} onChange={field.onChange}
                  error={!!errors.jobType}
                  placeholder={isAr ? 'مثل: دوام كامل ....' : 'e.g. Full Time ...'}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>

            <FormField label={salaryLabel} required error={errors.salary?.message}>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Input {...register('salary', { valueAsNumber: true })}
                    type="number" min="1" placeholder="10000"
                    hasError={!!errors.salary} endIcon={<Wallet size={15} />} />
                </div>
                <div className="w-28">
                  <Controller name="currency" control={control} render={({ field }) => (
                    <Combobox
                      items={CURRENCIES}
                      value={field.value ?? 'EGP'}
                      onChange={field.onChange}
                      searchPlaceholder={isAr ? 'ابحث عن عملة...' : 'Search currency...'}
                      noResultsText={isAr ? 'لا نتائج' : 'No results'} />
                  )} />
                </div>
              </div>
            </FormField>

            <FormField label={isAr ? 'وقت بدء الدوام' : 'Start Time'} required error={errors.startTime?.message}>
              <Input {...register('startTime')} type="time"
                hasError={!!errors.startTime} endIcon={<Clock size={15} />} />
            </FormField>

            <FormField label={isAr ? 'وقت انتهاء الدوام' : 'End Time'} required error={errors.endTime?.message}>
              <Input {...register('endTime')} type="time"
                hasError={!!errors.endTime} endIcon={<Clock size={15} />} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 p-4">
              <Clock size={15} className="text-[#709028] mt-0.5 shrink-0" />
              <p className="text-sm text-[#709028] leading-relaxed">
                {isAr
                  ? 'سيتم احتساب التأخر والانصراف المبكر والساعات الإضافية بناءً على هذه المواعيد.'
                  : 'Late arrivals, early departures, and overtime will be calculated based on these times.'}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
              <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                {isAr
                  ? 'سيتم ربط نموذج الراتب تلقائياً بحسابات الحضور والأداء لاحتساب الإضافي والخصومات.'
                  : 'The salary model will automatically link to attendance and performance to calculate overtime and deductions.'}
              </p>
            </div>
          </div>
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isFirst isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
