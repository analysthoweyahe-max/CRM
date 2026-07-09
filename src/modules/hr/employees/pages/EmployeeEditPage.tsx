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
import { Input }         from '@/shared/components/ui/Input';
import { Button }        from '@/shared/components/ui/Button';
import { useEmployee }   from '../hooks/useEmployee';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../hooks/useLookups';
import { employeeApi }   from '../api/employee.api';
import type { EmploymentType, EmployeeStatus } from '../types/employee.types';

/* ── form values ──────────────────────────────────────── */

interface EditFormValues {
  fullName:       string;
  email:          string;
  phone:          string;
  department:     string;
  jobTitle:       string;
  employmentType: string;
  basicSalary:    string;
  managerId:      string;
  status:         string;
  workingHours:   string;
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

  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<EditFormValues>({
    values: emp ? {
      fullName:       emp.name,
      email:          emp.email,
      phone:          emp.phone ?? '',
      department:     String(emp.department?.id ?? ''),
      jobTitle:       String(emp.jobTitle?.id ?? ''),
      employmentType: emp.employmentType ?? '',
      basicSalary:    String(emp.salary ?? ''),
      managerId:      String(emp.manager?.id ?? 'none'),
      status:         emp.status ?? 'active',
      workingHours:   String(emp.workingHours ?? 8),
    } : undefined,
  });

  const selectedDept                   = useWatch({ control, name: 'department' });
  const { data: jobTitles = [] }       = useJobTitles(selectedDept || undefined);
  const { data: employmentTypes = [] } = useEmploymentTypes();

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = jobTitles.map((j)   => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
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

  const mutation = useMutation({
    mutationFn: (data: EditFormValues) =>
      employeeApi.update(id!, {
        name:            data.fullName,
        email:           data.email,
        phone:           data.phone,
        department_id:   Number(data.department),
        job_title_id:    Number(data.jobTitle),
        manager_id:      data.managerId === 'none' ? null : data.managerId,
        joining_date:    emp?.joiningDate ?? undefined,
        status:          data.status as EmployeeStatus,
        employment_type: data.employmentType as EmploymentType,
        salary:          parseFloat(data.basicSalary) || undefined,
        working_hours:   Number(data.workingHours) || 8,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      navigate(ROUTES.EMPLOYEES.DETAIL(id!));
    },

    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      console.error('[EmployeeEditPage]', data);
      toast.error(data?.message || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
    },
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
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

            {/* Department */}
            <FormField label={isAr ? 'القسم' : 'Department'} icon={<Briefcase size={15} className="text-gray-400" />}>
              <Controller name="department" control={control} render={({ field }) => (
                <Combobox items={deptItems} value={field.value ?? ''} onChange={field.onChange}
                  placeholder={isAr ? 'اختر القسم' : 'Select department'} {...cbProps} />
              )} />
            </FormField>

            {/* Job title */}
            <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} icon={<Briefcase size={15} className="text-gray-400" />}>
              <Controller name="jobTitle" control={control} render={({ field }) => (
                <Combobox items={jTitleItems} value={field.value ?? ''} onChange={field.onChange}
                  placeholder={isAr ? 'اختر المسمى' : 'Select job title'} {...cbProps} />
              )} />
            </FormField>

            {/* Employment type */}
            <FormField label={isAr ? 'نوع التوظيف' : 'Employment Type'} icon={<Briefcase size={15} className="text-gray-400" />}>
              <Controller name="employmentType" control={control} render={({ field }) => (
                <Combobox items={empTypeItems} value={field.value ?? ''} onChange={field.onChange}
                  placeholder={isAr ? 'اختر نوع التوظيف' : 'Select type'} {...cbProps} />
              )} />
            </FormField>

            {/* Basic salary */}
            <FormField label={isAr ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)'} icon={<DollarSign size={15} className="text-gray-400" />}>
              <Input {...register('basicSalary')} type="number" min={0} endIcon={<Wallet size={15} />} placeholder="0" />
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
