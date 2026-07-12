import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, CalendarDays, Wallet, Clock, Info } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox } from '@/shared/components/form/Combobox';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { NavButtons } from './StepWizard';
import { RoleAssignmentSection } from './RoleAssignmentSection';
import {
  makeAllDataSchema,
  CURRENCIES,
  type AllDataValues,
  type RoleAssignmentValue,
} from './newEmployeeForm.types';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../../hooks/useLookups';
import { titleDepartmentId } from '../../types/employee.types';
import { useOrgSettingsData } from '@/modules/admin/org-settings/hooks/useOrgSettings';
import { usePermission } from '@/shared/hooks/usePermission';

interface Step1Props {
  isAr: boolean;
  isRTL: boolean;
  defaultValues?: Partial<AllDataValues>;
  roleAssignment: RoleAssignmentValue | null;
  onRoleAssignmentChange: (value: RoleAssignmentValue | null) => void;
  onNext: (d: AllDataValues) => void;
  onBack: () => void;
}

export function Step1BasicData({
  isAr, isRTL, defaultValues, roleAssignment, onRoleAssignmentChange, onNext, onBack,
}: Step1Props) {
  const canAssignRole = usePermission('assign-role');
  const { data: orgSettings } = useOrgSettingsData();
  const defaultDailyHours = orgSettings?.dailyWorkHours ?? 8;

  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<AllDataValues>({
    resolver: (v, c, o) => zodResolver(makeAllDataSchema(isAr, defaultDailyHours))(v, c, o),
    defaultValues: {
      managerId: 'none',
      workingHours: defaultDailyHours,
      currency: 'EGP',
      departmentIds: [],
      ...defaultValues,
    },
  });

  const selectedDeptIds = watch('departmentIds') ?? [];
  const selectedJobTitle = watch('jobTitle');

  useEffect(() => {
    if (orgSettings && defaultValues?.workingHours == null) {
      setValue('workingHours', orgSettings.dailyWorkHours ?? 8);
    }
  }, [orgSettings, defaultValues?.workingHours, setValue]);

  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: allJobTitles = [], isLoading: titlesLoading } = useJobTitles();
  const { data: employmentTypes = [], isLoading: typesLoading } = useEmploymentTypes();
  const { items: managerItems, isLoading: managersLoading } = useManagerOptions(isAr);

  const selectedDeptSet = useMemo(
    () => new Set(selectedDeptIds.map(String)),
    [selectedDeptIds],
  );

  const filteredTitles = useMemo(() => {
    if (selectedDeptSet.size === 0) return [];
    return allJobTitles.filter((t) => {
      const deptId = titleDepartmentId(t);
      return !deptId || selectedDeptSet.has(deptId);
    });
  }, [allJobTitles, selectedDeptSet]);

  useEffect(() => {
    if (!selectedJobTitle) return;
    const title = allJobTitles.find((t) => String(t.id) === selectedJobTitle);
    const titleDept = title ? titleDepartmentId(title) : '';
    if (titleDept && !selectedDeptSet.has(titleDept)) {
      setValue('jobTitle', '');
    }
  }, [selectedDeptSet, selectedJobTitle, allJobTitles, setValue]);

  const deptItems = departments.map((d) => ({
    id: String(d.id),
    label: isAr ? (d.nameAr || d.name) : d.name,
  }));

  const titleItems = filteredTitles.map((t) => ({
    id: String(t.id),
    label: isAr ? (t.nameAr || t.name) : t.name,
  }));

  const salaryLabel = isAr ? 'الراتب الشهري (ج.م)' : 'Monthly Salary (EGP)';
  const jobTypeItems = employmentTypes.map((t) => ({ id: t.value, label: t.label }));

  function handleDepartmentsChange(departmentIds: string[], onChange: (ids: string[]) => void) {
    onChange(departmentIds);
    const nextSet = new Set(departmentIds.map(String));
    const title = allJobTitles.find((t) => String(t.id) === selectedJobTitle);
    const titleDept = title ? titleDepartmentId(title) : '';
    if (selectedJobTitle && titleDept && !nextSet.has(titleDept)) {
      setValue('jobTitle', '');
    }
  }

  function handleJobTitleChange(jobTitleId: string, onChange: (id: string) => void) {
    onChange(jobTitleId);
    const title = allJobTitles.find((t) => String(t.id) === jobTitleId);
    const deptFromTitle = title ? titleDepartmentId(title) : '';
    if (deptFromTitle && !selectedDeptSet.has(deptFromTitle)) {
      setValue('departmentIds', [...selectedDeptIds, deptFromTitle]);
    }
  }

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-6">

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

            <FormField
              label={isAr ? 'الأقسام' : 'Departments'}
              required
              error={errors.departmentIds?.message}
            >
              <Controller name="departmentIds" control={control} render={({ field }) => (
                <MultiCombobox
                  items={deptItems}
                  values={field.value ?? []}
                  onChange={(ids) => handleDepartmentsChange(ids, field.onChange)}
                  error={!!errors.departmentIds}
                  placeholder={deptsLoading
                    ? (isAr ? 'جاري التحميل...' : 'Loading...')
                    : (isAr ? 'اختر قسماً أو أكثر' : 'Select one or more departments')}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'}
                  disabled={deptsLoading}
                />
              )} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required error={errors.jobTitle?.message}>
              <Controller name="jobTitle" control={control} render={({ field }) => (
                <Combobox
                  items={titleItems}
                  value={field.value ?? ''}
                  onChange={(id) => handleJobTitleChange(id, field.onChange)}
                  error={!!errors.jobTitle}
                  disabled={titlesLoading || selectedDeptIds.length === 0}
                  placeholder={
                    selectedDeptIds.length === 0
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
                <Combobox items={managerItems} value={field.value ?? 'none'} onChange={field.onChange}
                  placeholder={managersLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'بدون مدير مباشر' : 'No direct manager')}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'معلومات الدوام' : 'Work Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={isAr ? 'نوع التوظيف المناسب للموظف' : 'Employment Type'} required error={errors.jobType?.message}>
              <Controller name="jobType" control={control} render={({ field }) => (
                <Combobox items={jobTypeItems} value={field.value ?? ''} onChange={field.onChange}
                  error={!!errors.jobType}
                  placeholder={typesLoading
                    ? (isAr ? 'جاري التحميل...' : 'Loading...')
                    : (isAr ? 'مثل: دوام كامل ....' : 'e.g. Full Time ...')}
                  searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'} />
              )} />
            </FormField>

            <FormField label={salaryLabel} error={errors.salary?.message}>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Input {...register('salary', {
                    setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
                  })}
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

            <FormField
              label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Working Hours'}
              required
              error={errors.workingHours?.message}
            >
              <Input {...register('workingHours', {
                setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
              })}
                type="number" min="1" placeholder={String(defaultDailyHours)}
                hasError={!!errors.workingHours} endIcon={<Clock size={15} />} />
            </FormField>
          </div>

          {canAssignRole && (
            <RoleAssignmentSection
              isAr={isAr}
              value={roleAssignment}
              onChange={onRoleAssignmentChange}
            />
          )}
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 rounded-xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 p-4">
            <Clock size={15} className="text-[#709028] mt-0.5 shrink-0" />
            <p className="text-sm text-[#709028] leading-relaxed">
              {isAr
                ? 'يُحسب الدوام بعدد الساعات اليومية. المؤقت يبدأ فور تسجيل الحضور في أي وقت ولا يتوقف حتى الانصراف.'
                : 'Work is measured by daily hours. The timer starts on check-in at any time and runs until check-out.'}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
            <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
              {isAr
                ? 'التأخير والعمل الإضافي يُسجَّلان للمراجعة. الحضور المبكر مسموح والمؤقت يعمل فوراً.'
                : 'Late arrival and overtime are flagged for review. Early check-in is allowed and the timer starts immediately.'}
            </p>
          </div>
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isFirst isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
