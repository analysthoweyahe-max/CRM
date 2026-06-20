import { useParams, useNavigate }  from 'react-router-dom';
import { useForm, Controller }      from 'react-hook-form';
import { ArrowRight, ArrowLeft, Check, Mail, Phone, User, Briefcase, DollarSign, Activity } from 'lucide-react';
import { toast }        from 'sonner';
import { useLang }      from '@/app/providers/LanguageProvider';
import { ROUTES }       from '@/app/router/routes';
import { EMPLOYEES }    from '../data/employeeData';
import {
  DEPARTMENTS, JOB_TITLES, MANAGERS, JOB_TYPES,
} from '../components/NewEmployeeForm/newEmployeeForm.types';
import { FormField }    from '@/shared/components/form/FormField';
import { Combobox }     from '@/shared/components/form/Combobox';
import { Input }        from '@/shared/components/ui/Input';
import { Button }       from '@/shared/components/ui/Button';
import { Card }         from '@/shared/components/ui/Card';

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
}

export function EmployeeEditPage() {
  const { id }          = useParams<{ id: string }>();
  const { lang, isRTL } = useLang();
  const navigate        = useNavigate();
  const isAr            = lang === 'ar';

  const emp = EMPLOYEES.find((e) => e.id === id);

  const deptId     = DEPARTMENTS.find((d) => d.label === emp?.department)?.id  ?? DEPARTMENTS[0].id;
  const jobTitleId = JOB_TITLES.find((j) => j.label === emp?.jobTitle)?.id     ?? JOB_TITLES[0].id;

  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<EditFormValues>({
    defaultValues: emp ? {
      fullName:       isAr ? emp.name : emp.nameEn,
      email:          emp.email,
      phone:          emp.phone,
      department:     deptId,
      jobTitle:       jobTitleId,
      employmentType: 'full-time',
      basicSalary:    '19000',
      managerId:      emp.id === 'EMP-001' ? 'none' : 'EMP-001',
      status:         emp.status,
    } : {},
  });

  if (!emp) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الموظف غير موجود' : 'Employee not found'}
      </div>
    );
  }

  const name     = isAr ? emp.name : emp.nameEn;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  /* ── Combobox item lists ───────────────────────── */
  const employmentTypeItems = JOB_TYPES.map((t) => ({
    id:    t.id,
    label: isAr ? t.labelAr : t.labelEn,
  }));

  const statusItems = [
    { id: 'active',   label: isAr ? 'نشط'    : 'Active'   },
    { id: 'pending',  label: isAr ? 'معلق'   : 'Pending'  },
    { id: 'inactive', label: isAr ? 'مرفوض'  : 'Inactive' },
  ];

  async function onSubmit(data: EditFormValues) {
    await new Promise((r) => setTimeout(r, 600));
    console.log('Edit payload:', data);
    toast.success(isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
    navigate(ROUTES.EMPLOYEES.DETAIL(id!));
  }

  const cbProps = isAr
    ? { searchPlaceholder: 'ابحث...', noResultsText: 'لا نتائج' }
    : { searchPlaceholder: 'Search...', noResultsText: 'No results' };

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.EMPLOYEES.DETAIL(id!))}
          className="mt-1 p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isAr ? 'رجوع' : 'Back'}
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#302F33' }}>
            {isAr ? 'تعديل بيانات الموظف' : 'Edit Employee Data'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#595959' }}>{name}</p>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full name */}
            <FormField
              label={isAr ? 'الاسم الكامل' : 'Full Name'}
              required
              icon={<User size={15} className="text-gray-400" />}
            >
              <Input
                {...register('fullName')}
                endIcon={<User size={15} />}
                placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
              />
            </FormField>

            {/* Email */}
            <FormField
              label={isAr ? 'البريد الإلكتروني' : 'Email'}
              required
              icon={<Mail size={15} className="text-gray-400" />}
            >
              <Input
                {...register('email')}
                type="email"
                endIcon={<Mail size={15} />}
                placeholder="name@company.com"
              />
            </FormField>

            {/* Phone — Arabic: numbers right, icon left */}
            <FormField
              label={isAr ? 'رقم الهاتف' : 'Phone'}
              icon={<Phone size={15} className="text-gray-400" />}
            >
              <Input
                {...register('phone')}
                type="tel"
                placeholder="01xxxxxxxx"
                dir={isAr ? 'rtl' : 'ltr'}
                className={isAr ? 'text-right' : ''}
                endIcon={<Phone size={15} />}
              />
            </FormField>

            {/* Department */}
            <FormField
              label={isAr ? 'القسم' : 'Department'}
              icon={<Briefcase size={15} className="text-gray-400" />}
            >
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={DEPARTMENTS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={isAr ? 'اختر القسم' : 'Select department'}
                    {...cbProps}
                  />
                )}
              />
            </FormField>

            {/* Job title */}
            <FormField
              label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
              icon={<Briefcase size={15} className="text-gray-400" />}
            >
              <Controller
                name="jobTitle"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={JOB_TITLES}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={isAr ? 'اختر المسمى' : 'Select job title'}
                    {...cbProps}
                  />
                )}
              />
            </FormField>

            {/* Employment type */}
            <FormField
              label={isAr ? 'نوع التوظيف' : 'Employment Type'}
              icon={<Briefcase size={15} className="text-gray-400" />}
            >
              <Controller
                name="employmentType"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={employmentTypeItems}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={isAr ? 'اختر نوع التوظيف' : 'Select type'}
                    {...cbProps}
                  />
                )}
              />
            </FormField>

            {/* Basic salary */}
            <FormField
              label={isAr ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)'}
              icon={<DollarSign size={15} className="text-gray-400" />}
            >
              <Input
                {...register('basicSalary')}
                type="number"
                min={0}
                endIcon={<DollarSign size={15} />}
                placeholder="0"
              />
            </FormField>

            {/* Direct manager */}
            <FormField
              label={isAr ? 'المدير المباشر' : 'Direct Manager'}
              icon={<User size={15} className="text-gray-400" />}
            >
              <Controller
                name="managerId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={MANAGERS}
                    value={field.value ?? 'none'}
                    onChange={field.onChange}
                    placeholder={isAr ? 'بدون مدير مباشر' : 'No direct manager'}
                    {...cbProps}
                  />
                )}
              />
            </FormField>

            {/* Status */}
            <FormField
              label={isAr ? 'الحالة' : 'Status'}
              icon={<Activity size={15} className="text-gray-400" />}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={statusItems}
                    value={field.value ?? 'active'}
                    onChange={field.onChange}
                    placeholder={isAr ? 'اختر الحالة' : 'Select status'}
                    {...cbProps}
                  />
                )}
              />
            </FormField>

          </div>

          {/* ── Footer buttons ──────────────────────────── */}
          <div className="flex items-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
            <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
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
