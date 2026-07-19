import { useEffect, useMemo } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { ArrowRight, ArrowLeft, Check, Mail, Phone, User, Briefcase, DollarSign, Wallet, Activity, Clock } from 'lucide-react';
import { useMutation, useQueryClient }   from '@tanstack/react-query';
import { toast }         from 'sonner';
import { useLang }       from '@/app/providers/LanguageProvider';
import { ROUTES }        from '@/app/router/routes';
import { Card }          from '@/shared/components/ui/Card';
import { FormField }     from '@/shared/components/form/FormField';
import { Combobox }      from '@/shared/components/form/Combobox';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { Input }         from '@/shared/components/ui/Input';
import { Button }        from '@/shared/components/ui/Button';
import { useEmployee }   from '../hooks/useEmployee';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../hooks/useLookups';
import { employeeApi }   from '../api/employee.api';
import {
  employeeDepartmentIds,
  titleDepartmentId,
  toDepartmentIds,
  type ApiEmployee,
  type EmploymentType,
  type EmployeeStatus,
} from '../types/employee.types';
import { CURRENCIES, resolveCurrency } from '../components/NewEmployeeForm/newEmployeeForm.types';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';

/* ── form values ──────────────────────────────────────── */

interface EditFormValues {
  fullName:       string;
  email:          string;
  phone:          string;
  departmentIds:  string[];
  jobTitle:       string;
  employmentType: string;
  basicSalary:    string;
  currency:       string;
  managerId:      string;
  status:         string;
  workingHours:   string;
}

function toEditFormValues(emp: ApiEmployee): EditFormValues {
  return {
    fullName:       emp.name,
    email:          emp.email,
    phone:          emp.phone ?? '',
    departmentIds:  employeeDepartmentIds(emp),
    jobTitle:       String(emp.jobTitle?.id ?? ''),
    employmentType: emp.employmentType ?? '',
    basicSalary:    String(emp.salary ?? ''),
    currency:       resolveCurrency(emp.currency),
    managerId:      String(emp.manager?.id ?? 'none'),
    status:         emp.status ?? 'active',
    workingHours:   String(emp.workingHours ?? 8),
  };
}

/* ── page ─────────────────────────────────────────────── */

export function EmployeeEditPage() {
  const { id }          = useParams<{ id: string }>();
  const { lang, isRTL } = useLang();
  const navigate        = useNavigate();
  const isAr            = lang === 'ar';
  const queryClient     = useQueryClient();

  const { data: emp, isLoading } = useEmployee(id);
  const { data: departments = [] } = useDepartments();
  const { data: allJobTitles = [], isLoading: titlesLoading } = useJobTitles();

  const { register, control, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm<EditFormValues>({
    defaultValues: {
      fullName: '', email: '', phone: '', departmentIds: [], jobTitle: '',
      employmentType: '', basicSalary: '', currency: 'EGP', managerId: 'none',
      status: 'active', workingHours: '8',
    },
  });

  // Reset every field — including currency — once the employee payload arrives.
  useEffect(() => {
    if (emp) reset(toEditFormValues(emp));
  }, [emp, reset]);

  const selectedDeptIds                = useWatch({ control, name: 'departmentIds' }) ?? [];
  const selectedJobTitle               = useWatch({ control, name: 'jobTitle' }) ?? '';
  const { data: employmentTypes = [] } = useEmploymentTypes();

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

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = filteredTitles.map((j) => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = employmentTypes.map((t) => ({ id: t.value, label: t.label }));
  const { items: managerItems } = useManagerOptions(isAr, id);

  const statusItems = [
    { id: 'active',   label: isAr ? 'نشط'    : 'Active'   },
    { id: 'pending',  label: isAr ? 'معلق'   : 'Pending'  },
    { id: 'inactive', label: isAr ? 'غير نشط': 'Inactive' },
  ];

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

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

  const mutation = useMutation({
    mutationFn: (data: EditFormValues) =>
      employeeApi.update(id!, {
        name:            data.fullName,
        email:           data.email,
        phone:           data.phone,
        department_ids:  toDepartmentIds(data.departmentIds),
        job_title_id:    Number(data.jobTitle),
        manager_id:      data.managerId === 'none' ? null : data.managerId,
        joining_date:    emp?.joiningDate ?? undefined,
        status:          data.status as EmployeeStatus,
        employment_type: data.employmentType as EmploymentType,
        salary:          parseFloat(data.basicSalary) || undefined,
        currency:        data.currency || undefined,
        working_hours:   Number(data.workingHours) || 8,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      navigate(ROUTES.EMPLOYEES.DETAIL(id!));
    },

    onError: (err: unknown) => {
      const fieldErrors = extractApiFieldErrors(err);
      const deptErr = fieldErrors.departmentIds || fieldErrors.jobTitleId || fieldErrors.job_title_id;
      toast.error(deptErr || extractApiError(err) || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
    },
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const deptError = errors.departmentIds?.message
    || (selectedDeptIds.length === 0 ? (isAr ? 'اختر قسماً واحداً على الأقل' : 'Select at least one department') : undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الموظف غير موجود' : 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.EMPLOYEES.DETAIL(id!))}
          className="mt-1 p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'تعديل بيانات الموظف' : 'Edit Employee Data'}
          </h1>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{emp.name}</p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit((d) => {
          if (d.departmentIds.length === 0) return;
          mutation.mutate(d);
        })}
        noValidate
      >
        <Card padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full name */}
            <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required icon={<User size={15} className="text-gray-400" />}>
              <Input {...register('fullName')} endIcon={<User size={15} />} placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'} />
            </FormField>

            {/* Email */}
            <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required icon={<Mail size={15} className="text-gray-400" />}>
              <Input {...register('email')} type="email" endIcon={<Mail size={15} />} placeholder="name@company.com" />
            </FormField>

            {/* Phone */}
            <FormField label={isAr ? 'رقم الهاتف' : 'Phone'} icon={<Phone size={15} className="text-gray-400" />}>
              <Input {...register('phone')} type="tel" dir={isAr ? 'rtl' : 'ltr'} endIcon={<Phone size={15} />} placeholder="01xxxxxxxx" />
            </FormField>

            {/* Departments */}
            <FormField
              label={isAr ? 'الأقسام' : 'Departments'}
              required
              icon={<Briefcase size={15} className="text-gray-400" />}
              error={deptError}
            >
              <Controller name="departmentIds" control={control} render={({ field }) => (
                <MultiCombobox
                  items={deptItems}
                  values={field.value ?? []}
                  onChange={(ids) => handleDepartmentsChange(ids, field.onChange)}
                  error={!!deptError && selectedDeptIds.length === 0}
                  placeholder={isAr ? 'اختر قسماً أو أكثر' : 'Select one or more departments'}
                  {...cbProps}
                />
              )} />
            </FormField>

            {/* Job title */}
            <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} icon={<Briefcase size={15} className="text-gray-400" />}>
              <Controller name="jobTitle" control={control} render={({ field }) => (
                <Combobox
                  items={jTitleItems}
                  value={field.value ?? ''}
                  onChange={(id) => handleJobTitleChange(id, field.onChange)}
                  disabled={titlesLoading || selectedDeptIds.length === 0}
                  placeholder={
                    selectedDeptIds.length === 0
                      ? (isAr ? 'اختر القسم أولاً' : 'Select department first')
                      : (isAr ? 'اختر المسمى' : 'Select job title')
                  }
                  {...cbProps}
                />
              )} />
            </FormField>

            {/* Employment type */}
            <FormField label={isAr ? 'نوع التوظيف' : 'Employment Type'} icon={<Briefcase size={15} className="text-gray-400" />}>
              <Controller name="employmentType" control={control} render={({ field }) => (
                <Combobox items={empTypeItems} value={field.value ?? ''} onChange={field.onChange}
                  placeholder={isAr ? 'اختر نوع التوظيف' : 'Select type'} {...cbProps} />
              )} />
            </FormField>

            {/* Basic salary + currency */}
            <FormField label={isAr ? 'الراتب الأساسي' : 'Basic Salary'} icon={<DollarSign size={15} className="text-gray-400" />}>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Input {...register('basicSalary')} type="number" min={0} endIcon={<Wallet size={15} />} placeholder="0" />
                </div>
                <div className="w-32 shrink-0">
                  <Controller name="currency" control={control} render={({ field }) => (
                    <Combobox
                      items={CURRENCIES}
                      value={field.value ?? 'EGP'}
                      onChange={field.onChange}
                      triggerShowsDetail={false}
                      searchPlaceholder={isAr ? 'ابحث عن عملة...' : 'Search currency...'}
                      noResultsText={isAr ? 'لا نتائج' : 'No results'}
                    />
                  )} />
                </div>
              </div>
            </FormField>

            {/* Manager */}
            <FormField label={isAr ? 'المدير المباشر' : 'Direct Manager'} icon={<User size={15} className="text-gray-400" />}>
              <Controller name="managerId" control={control} render={({ field }) => (
                <Combobox items={managerItems} value={field.value ?? 'none'} onChange={field.onChange}
                  placeholder={isAr ? 'بدون مدير مباشر' : 'No direct manager'} {...cbProps} />
              )} />
            </FormField>

            <FormField label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Working Hours'} icon={<Clock size={15} className="text-gray-400" />}>
              <Input {...register('workingHours')} type="number" min={1} endIcon={<Clock size={15} />} placeholder="8" />
            </FormField>

            {/* Status */}
            <FormField label={isAr ? 'الحالة' : 'Status'} icon={<Activity size={15} className="text-gray-400" />}>
              <Controller name="status" control={control} render={({ field }) => (
                <Combobox items={statusItems} value={field.value ?? 'active'} onChange={field.onChange}
                  placeholder={isAr ? 'اختر الحالة' : 'Select status'} {...cbProps} />
              )} />
            </FormField>

          </div>

          {/* ── Footer ───────────────────────────────── */}
          <div className="flex items-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="submit"
              isLoading={isSubmitting || mutation.isPending}
              startIcon={<Check size={15} />}
            >
              {isAr ? 'حفظ التعديلات' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.EMPLOYEES.DETAIL(id!))}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </Card>
      </form>

    </div>
  );
}
