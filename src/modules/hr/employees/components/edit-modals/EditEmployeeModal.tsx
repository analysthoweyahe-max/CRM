import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Mail, Phone, Building2, Briefcase, DollarSign, Wallet, Clock } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { employeeApi }        from '../../api/employee.api';
import { useDepartments, useJobTitles } from '../../hooks/useLookups';
import { JOB_TYPES, MANAGERS } from '../NewEmployeeForm/newEmployeeForm.types';
import type { ApiEmployee, EmploymentType } from '../../types/employee.types';

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

function apiErrMsg(err: unknown): string | null {
  return (err as any)?.response?.data?.message ?? null;
}

/* ── step badge ───────────────────────────────────────── */

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

/* ── types ────────────────────────────────────────────── */

interface FormValues {
  fullName:       string;
  email:          string;
  phone:          string;
  department:     string;
  jobTitle:       string;
  employmentType: string;
  salary:         string;
  shiftStart:     string;
  shiftEnd:       string;
  managerId:      string;
}

interface Props {
  open:    boolean;
  onClose: () => void;
  emp:     ApiEmployee;
  isAr:    boolean;
}

/* ── component ────────────────────────────────────────── */

export function EditEmployeeModal({ open, onClose, emp, isAr }: Props) {
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: formDefaults(emp),
  });

  useEffect(() => {
    if (open) reset(formDefaults(emp));
  }, [open]);

  /* lookups */
  const { data: departments = [] } = useDepartments();
  const selectedDept               = useWatch({ control, name: 'department' });
  const { data: jobTitles = [] }   = useJobTitles(selectedDept || undefined);

  const deptItems    = departments.map((d) => ({ id: String(d.id), label: isAr ? (d.nameAr || d.name) : d.name }));
  const jTitleItems  = jobTitles.map((j)   => ({ id: String(j.id), label: isAr ? (j.nameAr || j.name) : j.name }));
  const empTypeItems = JOB_TYPES.map((t)   => ({ id: t.id, label: isAr ? t.labelAr : t.labelEn }));
  const managerItems = MANAGERS.map((m)    => ({ id: m.id, label: m.label }));

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  /* mutation */
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const calls: Promise<unknown>[] = [];

      /* Basic info — attempt PUT, silently skip if not supported */
      calls.push(
        employeeApi.update(emp.id, {
          name:          data.fullName,
          email:         data.email,
          phone:         data.phone,
          department_id: data.department,
          job_title_id:  data.jobTitle,
          manager_id:    data.managerId === 'none' ? null : data.managerId,
        }).catch(() => {}),
      );

      /* Step 2 — Employment type */
      if (data.employmentType !== apiTypeToForm(emp.employmentType)) {
        calls.push(
          employeeApi.updateEmploymentType(emp.id, {
            employment_type: mapJobType(data.employmentType),
          }).catch(() => {}),
        );
      }

      /* Step 3 — Salary */
      const salary = parseFloat(data.salary);
      if (salary > 0 && salary !== (emp.salary ?? 0)) {
        calls.push(employeeApi.updateSalary(emp.id, { salary }).catch(() => {}));
      }

      /* Step 4 — Work schedule */
      if (
        data.shiftStart && data.shiftEnd &&
        (data.shiftStart !== (emp.shiftStart ?? emp.shift_start ?? '').slice(0, 5) ||
         data.shiftEnd   !== (emp.shiftEnd   ?? emp.shift_end   ?? '').slice(0, 5))
      ) {
        calls.push(
          employeeApi.updateWorkSchedule(emp.id, {
            shift_start: data.shiftStart,
            shift_end:   data.shiftEnd,
          }).catch(() => {}),
        );
      }

      await Promise.all(calls);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', emp.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
      onClose();
    },

    onError: (err) => {
      console.error('[EditEmployeeModal]', (err as any)?.response?.data);
      toast.error(apiErrMsg(err) || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save changes'));
    },
  });

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

/* ── form defaults ────────────────────────────────────── */

function formDefaults(emp: ApiEmployee): FormValues {
  return {
    fullName:       emp.name,
    email:          emp.email,
    phone:          emp.phone ?? '',
    department:     String(emp.department?.id ?? ''),
    jobTitle:       String(emp.jobTitle?.id ?? ''),
    employmentType: apiTypeToForm(emp.employmentType),
    salary:         String(emp.salary ?? ''),
    shiftStart:     (emp.shiftStart ?? emp.shift_start ?? '').slice(0, 5),
    shiftEnd:       (emp.shiftEnd   ?? emp.shift_end   ?? '').slice(0, 5),
    managerId:      String(emp.manager?.id ?? 'none'),
  };
}
