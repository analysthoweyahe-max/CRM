import { User, Mail, Phone, Building2, Briefcase, DollarSign, Wallet, Clock } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { useEditEmployeeModal } from './useEditEmployeeModal';
import type { EditEmployeeModalProps } from './EditEmployeeModal.types';

function StepDivider({
  step, labelAr, labelEn, optional = false, isAr,
}: {
  step: number; labelAr: string; labelEn: string; optional?: boolean; isAr: boolean;
}) {
  return (
    <div className="sm:col-span-2 flex items-center gap-2.5 pt-3 mt-1 border-t border-gray-100 dark:border-gray-700">
      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide
                       bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase">
        POST
      </span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {isAr ? labelAr : labelEn}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        ({isAr ? `الخطوة ${step}` : `Step ${step}`}
        {optional && (isAr ? ' — اختياري' : ' — optional')}
        )
      </span>
    </div>
  );
}

export function EditEmployeeModal(props: EditEmployeeModalProps) {
  const { open, onClose, emp, isAr } = props;

  const {
    register, control, handleSubmit, mutation,
    deptItems, jTitleItems, empTypeItems, managerItems, cbProps,
  } = useEditEmployeeModal(props);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل بيانات الموظف' : 'Edit Employee Data'}
      description={emp.name}
      size="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            isLoading={mutation.isPending}
            onClick={handleSubmit((d) => mutation.mutate(d))}
          >
            {isAr ? 'حفظ التعديلات' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

        {/* ── Basic info ──────────────────────────────── */}
        <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required icon={<User size={15} className="text-gray-400" />}>
          <Input {...register('fullName')} endIcon={<User size={15} />} placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'} />
        </FormField>

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required icon={<Mail size={15} className="text-gray-400" />}>
          <Input {...register('email')} type="email" endIcon={<Mail size={15} />} placeholder="name@company.com" />
        </FormField>

        <FormField label={isAr ? 'رقم الهاتف' : 'Phone'} icon={<Phone size={15} className="text-gray-400" />}>
          <Input {...register('phone')} type="tel" dir={isAr ? 'rtl' : 'ltr'} endIcon={<Phone size={15} />} placeholder="01xxxxxxxx" />
        </FormField>

        <FormField label={isAr ? 'القسم' : 'Department'} icon={<Building2 size={15} className="text-gray-400" />}>
          <Controller name="department" control={control} render={({ field }) => (
            <Combobox items={deptItems} value={field.value ?? ''} onChange={field.onChange}
              placeholder={isAr ? 'اختر القسم' : 'Select department'} {...cbProps} />
          )} />
        </FormField>

        <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} icon={<Briefcase size={15} className="text-gray-400" />}>
          <Controller name="jobTitle" control={control} render={({ field }) => (
            <Combobox items={jTitleItems} value={field.value ?? ''} onChange={field.onChange}
              placeholder={isAr ? 'اختر المسمى' : 'Select job title'} {...cbProps} />
          )} />
        </FormField>

        <FormField label={isAr ? 'المدير المباشر' : 'Direct Manager'} icon={<User size={15} className="text-gray-400" />}>
          <Controller name="managerId" control={control} render={({ field }) => (
            <Combobox items={managerItems} value={field.value ?? 'none'} onChange={field.onChange}
              placeholder={isAr ? 'بدون مدير مباشر' : 'No direct manager'} {...cbProps} />
          )} />
        </FormField>

        {/* ── Step 2: Employment Type ──────────────────── */}
        <StepDivider step={2}
          labelAr="تحديث نوع التوظيف" labelEn="Update Employment Type" isAr={isAr} />

        <FormField label={isAr ? 'نوع التوظيف' : 'Employment Type'} icon={<Briefcase size={15} className="text-gray-400" />}>
          <Controller name="employmentType" control={control} render={({ field }) => (
            <Combobox items={empTypeItems} value={field.value ?? ''} onChange={field.onChange}
              placeholder={isAr ? 'اختر نوع التوظيف' : 'Select type'} {...cbProps} />
          )} />
        </FormField>

        {/* ── Step 3: Salary ───────────────────────────── */}
        <StepDivider step={3}
          labelAr="تحديث الراتب" labelEn="Update Salary" optional isAr={isAr} />

        <FormField label={isAr ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)'} icon={<DollarSign size={15} className="text-gray-400" />}>
          <Input {...register('salary')} type="number" min={0} endIcon={<Wallet size={15} />} placeholder="0" />
        </FormField>

        {/* ── Step 4: Work Schedule ────────────────────── */}
        <StepDivider step={4}
          labelAr="تحديث جدول الدوام" labelEn="Update Work Schedule" isAr={isAr} />

        <FormField label={isAr ? 'وقت بداية الدوام' : 'Shift Start'} icon={<Clock size={15} className="text-gray-400" />}>
          <Input {...register('shiftStart')} type="time" endIcon={<Clock size={15} />} />
        </FormField>

        <FormField label={isAr ? 'وقت نهاية الدوام' : 'Shift End'} icon={<Clock size={15} className="text-gray-400" />}>
          <Input {...register('shiftEnd')} type="time" endIcon={<Clock size={15} />} />
        </FormField>

      </div>
    </Modal>
  );
}
