import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { BadgeDollarSign, CalendarDays, FileText, StickyNote, User, Tag } from 'lucide-react';
import { Input }       from '@/shared/components/ui/Input';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox, type ComboboxItem } from '@/shared/components/form/Combobox';
import type { AddDeductionFormValues } from '../types/addDeduction.types';

interface Props {
  register:   UseFormRegister<AddDeductionFormValues>;
  control:    Control<AddDeductionFormValues>;
  errors:     FieldErrors<AddDeductionFormValues>;
  empItems:   ComboboxItem[];
  typeItems:  ComboboxItem[];
  monthItems: ComboboxItem[];
  isAr:       boolean;
}

export function DeductionFormFields({ register, control, errors, empItems, typeItems, monthItems, isAr }: Props) {
  return (
    <>
      <FormField label={isAr ? 'الموظف' : 'Employee'} required
        icon={<User size={15} className="text-gray-400" />} error={errors.employee_id?.message}>
        <Controller name="employee_id" control={control} render={({ field }) => (
          <Combobox items={empItems} value={field.value ?? ''} onChange={field.onChange}
            error={!!errors.employee_id}
            placeholder={isAr ? 'ابحث عن موظف...' : 'Search for an employee...'}
            searchPlaceholder={isAr ? 'ابحث باسم الموظف...' : 'Search by name...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'} />
        )} />
      </FormField>

      <FormField label={isAr ? 'نوع الخصم' : 'Deduction Type'} required
        icon={<Tag size={15} className="text-gray-400" />} error={errors.deduction_type?.message}>
        <Controller name="deduction_type" control={control} render={({ field }) => (
          <Combobox items={typeItems} value={field.value ?? ''} onChange={field.onChange}
            error={!!errors.deduction_type}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'} noResultsText={isAr ? 'لا نتائج' : 'No results'} />
        )} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label={isAr ? 'الشهر المالي' : 'Financial Month'} required
          icon={<CalendarDays size={15} className="text-gray-400" />} error={errors.financial_month?.message}>
          <Controller name="financial_month" control={control} render={({ field }) => (
            <Combobox items={monthItems} value={field.value ?? ''} onChange={field.onChange}
              error={!!errors.financial_month}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'} noResultsText={isAr ? 'لا نتائج' : 'No results'} />
          )} />
        </FormField>

        <FormField label={isAr ? 'مبلغ الخصم' : 'Deduction Amount'} required
          icon={<BadgeDollarSign size={15} className="text-gray-400" />} error={errors.amount?.message}>
          <Input {...register('amount')} type="number" min="1" placeholder="0"
            hasError={!!errors.amount} endIcon={<BadgeDollarSign size={15} />} />
        </FormField>
      </div>

      <FormField label={isAr ? 'سبب الخصم' : 'Reason'} required
        icon={<FileText size={15} className="text-gray-400" />} error={errors.reason?.message}>
        <Input {...register('reason')} type="text"
          placeholder={isAr ? 'مثال: غياب بدون إذن' : 'e.g. Absence without permission'}
          hasError={!!errors.reason} />
      </FormField>

      <FormField label={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
        icon={<StickyNote size={15} className="text-gray-400" />}>
        <textarea {...register('notes')} rows={4}
          placeholder={isAr ? 'تفاصيل إضافية' : 'Additional details'}
          className={`${inputCls(false)} resize-none`} />
      </FormField>
    </>
  );
}
