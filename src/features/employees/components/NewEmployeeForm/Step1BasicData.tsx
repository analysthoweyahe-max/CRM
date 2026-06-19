import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Briefcase, CalendarDays } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { NavButtons } from './StepWizard';
import {
  makeStep1Schema,
  DEPARTMENTS, JOB_TITLES, MANAGERS,
  type Step1Values,
} from './newEmployeeForm.types';

interface Step1Props {
  isAr:           boolean;
  isRTL:          boolean;
  defaultValues?: Partial<Step1Values>;
  onNext:         (d: Step1Values) => void;
  onBack:         () => void;
}

export function Step1BasicData({ isAr, isRTL, defaultValues, onNext, onBack }: Step1Props) {
  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1Values>({
    resolver: (v, c, o) => zodResolver(makeStep1Schema(isAr))(v, c, o),
    defaultValues: { managerId: 'none', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required
            icon={<User size={15} className="text-gray-400" />} error={errors.fullName?.message}>
            <Input {...register('fullName')}
              placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
              hasError={!!errors.fullName} endIcon={<User size={15} />} />
          </FormField>

          <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required
            icon={<Mail size={15} className="text-gray-400" />} error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="name@company.com"
              hasError={!!errors.email} endIcon={<Mail size={15} />} />
          </FormField>

       <FormField
  label={isAr ? 'رقم الهاتف' : 'Phone Number'}
  icon={<Phone size={15} className="text-gray-400" />}
>
  <Input
    {...register('phone')}
    type="tel"
    placeholder="01xxxxxxxx"
    dir={isAr ? 'rtl' : 'ltr'}
    className={isAr ? 'text-right' : 'text-left'}
    endIcon={<Phone size={15} />}
  />
</FormField>

          <FormField label={isAr ? 'القسم' : 'Department'} required
            icon={<Briefcase size={15} className="text-gray-400" />} error={errors.department?.message}>
            <Controller name="department" control={control} render={({ field }) => (
              <Combobox items={DEPARTMENTS} value={field.value ?? ''} onChange={field.onChange}
                error={!!errors.department}
                placeholder={isAr ? 'اختر القسم' : 'Select department'}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'} />
            )} />
          </FormField>

          <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required
            icon={<Briefcase size={15} className="text-gray-400" />} error={errors.jobTitle?.message}>
            <Controller name="jobTitle" control={control} render={({ field }) => (
              <Combobox items={JOB_TITLES} value={field.value ?? ''} onChange={field.onChange}
                error={!!errors.jobTitle}
                placeholder={isAr ? 'اختر المسمى' : 'Select job title'}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'} />
            )} />
          </FormField>

          <FormField label={isAr ? 'تاريخ الالتحاق' : 'Hire Date'} required
            icon={<CalendarDays size={15} className="text-gray-400" />} error={errors.hireDate?.message}>
            <Input {...register('hireDate')} type="date" hasError={!!errors.hireDate} />
          </FormField>

        </div>

        <FormField label={isAr ? 'المدير المباشر (اختياري)' : 'Direct Manager (optional)'}
          icon={<User size={15} className="text-gray-400" />}>
          <Controller name="managerId" control={control} render={({ field }) => (
            <Combobox items={MANAGERS} value={field.value ?? 'none'} onChange={field.onChange}
              placeholder={isAr ? 'بدون مدير مباشر' : 'No direct manager'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'} />
          )} />
        </FormField>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isFirst isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
