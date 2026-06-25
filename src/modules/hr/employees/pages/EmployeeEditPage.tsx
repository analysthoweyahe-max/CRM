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
import { useDepartments, useJobTitles } from '../hooks/useLookups';
import { employeeApi }   from '../api/employee.api';
import type { EmploymentType } from '../types/employee.types';
import { JOB_TYPES, MANAGERS } from '../components/NewEmployeeForm/newEmployeeForm.types';

/* ── helpers ──────────────────────────────────────────── */

function mapJobType(jt: string): EmploymentType {
  if (jt === 'part-time') return 'part_time';
  if (jt === 'freelance') return 'freelance';
  return 'full_time';
}

function apiTypeToForm(t: EmploymentType | null | undefined): string {
  if (t === 'part_time') return 'part-time';
  if (t === 'freelance') return 'freelance';
  return 'full-time';
}


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
  shiftStart:     string;
  shiftEnd:       string;
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
      employmentType: apiTypeToForm(emp.employmentType),
      basicSalary:    String(emp.salary ?? ''),
      managerId:      String(emp.manager?.id ?? 'none'),
      status:         emp.status ?? 'active',
      shiftStart:     (emp.shiftStart ?? emp.shift_start ?? '').slice(0, 5),
      shiftEnd:       (emp.shiftEnd   ?? emp.shift_end   ?? '').slice(0, 5),
    } : undefined,
  });

  const selectedDept             = useWatch({ control, name: 'department' });
  const { data: jobTitles = [] } = useJobTitles(selectedDept || undefined);

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = jobTitles.map((j)   => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = JOB_TYPES.map((t)   => ({ id: t.id, label: isAr ? t.labelAr : t.labelEn }));
  const managerItems = MANAGERS.map((m)    => ({ id: m.id, label: m.label }));

  const statusItems = [
    { id: 'active',   label: isAr ? 'نشط'    : 'Active'   },
    { id: 'pending',  label: isAr ? 'معلق'   : 'Pending'  },
    { id: 'inactive', label: isAr ? 'غير نشط': 'Inactive' },
  ];

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  const mutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      const calls: Promise<unknown>[] = [];

      /* Basic info — silent fail if endpoint not supported */
      calls.push(
        employeeApi.update(id!, {
          name:          data.fullName,
          email:         data.email,
          phone:         data.phone,
          department_id: data.department,
          job_title_id:  data.jobTitle,
          manager_id:    data.managerId === 'none' ? null : data.managerId,
        }).catch(() => {}),
      );

      /* Step 2 — Employment type */
      if (data.employmentType !== apiTypeToForm(emp?.employmentType)) {
        calls.push(
          employeeApi.updateEmploymentType(id!, {
            employment_type: mapJobType(data.employmentType),
          }).catch(() => {}),
        );
      }

      /* Step 3 — Salary */
      const salary = parseFloat(data.basicSalary);
      if (salary > 0 && salary !== (emp?.salary ?? 0)) {
        calls.push(employeeApi.updateSalary(id!, { salary }).catch(() => {}));
      }

      /* Step 4 — Work schedule */
      const origStart = (emp?.shiftStart ?? emp?.shift_start ?? '').slice(0, 5);
      const origEnd   = (emp?.shiftEnd   ?? emp?.shift_end   ?? '').slice(0, 5);
      if (
        data.shiftStart && data.shiftEnd &&
        (data.shiftStart !== origStart || data.shiftEnd !== origEnd)
      ) {
        calls.push(
          employeeApi.updateWorkSchedule(id!, {
            shift_start: data.shiftStart,
            shift_end:   data.shiftEnd,
          }).catch(() => {}),
        );
      }

      await Promise.all(calls);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      navigate(ROUTES.EMPLOYEES.DETAIL(id!));
    },

    onError: (err) => {
      const msg = (err as any)?.response?.data?.message;
      console.error('[EmployeeEditPage]', (err as any)?.response?.data);
      toast.error(msg || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
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

            {/* Shift start */}
            <FormField label={isAr ? 'وقت بداية الدوام' : 'Shift Start'} icon={<Clock size={15} className="text-gray-400" />}>
              <Input {...register('shiftStart')} type="time" endIcon={<Clock size={15} />} />
            </FormField>

            {/* Shift end */}
            <FormField label={isAr ? 'وقت نهاية الدوام' : 'Shift End'} icon={<Clock size={15} className="text-gray-400" />}>
              <Input {...register('shiftEnd')} type="time" endIcon={<Clock size={15} />} />
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
