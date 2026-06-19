import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Clock, Info, Mail } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { NavButtons } from './StepWizard';
import {
  makeStep3Schema, step4Schema,
  DEPARTMENTS, JOB_TITLES, MANAGERS, JOB_TYPES,
  type Step3Values, type Step4Values, type AllFormData,
} from './newEmployeeForm.types';

/* ─── Step 3: معلومات الراتب ──────────────────────── */
interface Step3Props {
  isAr:           boolean;
  isRTL:          boolean;
  jobType?:       string;
  defaultValues?: Partial<Step3Values>;
  onNext:         (d: Step3Values) => void;
  onBack:         () => void;
}

export function Step3Salary({ isAr, isRTL, jobType, defaultValues, onNext, onBack }: Step3Props) {
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step3Values>({
    resolver: (v, c, o) => zodResolver(makeStep3Schema(isAr))(v, c, o),
    defaultValues: defaultValues ?? {},
  });

  const salaryLabel = jobType === 'part-time'
    ? (isAr ? 'الراتب بالساعة (ج.م)'     : 'Hourly Rate (EGP)')
    : jobType === 'freelance'
    ? (isAr ? 'الأتعاب لكل مشروع (ج.م)' : 'Project Fee (EGP)')
    : (isAr ? 'الراتب الشهري (ج.م)'      : 'Monthly Salary (EGP)');

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-5">

        <FormField label={salaryLabel} required
          icon={<Wallet size={15} className="text-gray-400" />} error={errors.salary?.message}>
          <Input
            {...register('salary', { valueAsNumber: true })}
            type="number" min="1" placeholder="10000"
            hasError={!!errors.salary} endIcon={<Wallet size={15} />}
          />
        </FormField>

        <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
          <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
            {isAr
              ? 'سيتم ربط نموذج الراتب تلقائياً بحسابات الحضور والأداء لاحتساب الإضافي والخصومات.'
              : 'The salary model will automatically link to attendance and performance to calculate overtime and deductions.'}
          </p>
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}

/* ─── Step 4: معلومات الدوام ─────────────────────── */
interface Step4Props {
  isAr:           boolean;
  isRTL:          boolean;
  defaultValues?: Partial<Step4Values>;
  onNext:         (d: Step4Values) => void;
  onBack:         () => void;
}

export function Step4Attendance({ isAr, isRTL, defaultValues, onNext, onBack }: Step4Props) {
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: { startTime: '09:00', endTime: '17:00', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label={isAr ? 'وقت بدء الدوام' : 'Start Time'}
            icon={<Clock size={15} className="text-gray-400" />} error={errors.startTime?.message}>
            <Input {...register('startTime')} type="time"
              hasError={!!errors.startTime} endIcon={<Clock size={15} />} />
          </FormField>

          <FormField label={isAr ? 'وقت انتهاء الدوام' : 'End Time'}
            icon={<Clock size={15} className="text-gray-400" />} error={errors.endTime?.message}>
            <Input {...register('endTime')} type="time"
              hasError={!!errors.endTime} endIcon={<Clock size={15} />} />
          </FormField>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 p-4">
          <Clock size={15} className="text-[#709028] mt-0.5 shrink-0" />
          <p className="text-sm text-[#709028] leading-relaxed">
            {isAr
              ? 'سيتم احتساب التأخر والانصراف المبكر والساعات الإضافية بناءً على هذه المواعيد.'
              : 'Late arrivals, early departures, and overtime will be calculated based on these times.'}
          </p>
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}

/* ─── Step 5: مراجعة وإرسال ──────────────────────── */
interface Step5Props {
  isAr:     boolean;
  isRTL:    boolean;
  formData: AllFormData;
  onBack:   () => void;
  onSubmit: () => Promise<void>;
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm min-w-0">
      <span className="text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 dark:text-gray-200 font-medium break-all">{value || '—'}</span>
    </div>
  );
}

export function Step5Review({ isAr, isRTL, formData, onBack, onSubmit }: Step5Props) {
  const { handleSubmit, formState: { isSubmitting } } = useForm();

  const s1 = formData.step1;
  const s2 = formData.step2;
  const s3 = formData.step3;
  const s4 = formData.step4;

  const deptLabel    = DEPARTMENTS.find(d => d.id === s1?.department)?.label ?? s1?.department ?? '—';
  const titleLabel   = JOB_TITLES.find(t => t.id === s1?.jobTitle)?.label    ?? s1?.jobTitle   ?? '—';
  const managerLabel = !s1?.managerId || s1.managerId === 'none'
    ? (isAr ? 'بدون مدير مباشر' : 'No manager')
    : (MANAGERS.find(m => m.id === s1.managerId)?.label ?? '—');
  const jobTypeLabel = JOB_TYPES.find(t => t.id === s2?.jobType)?.labelAr ?? s2?.jobType ?? '—';
  const salaryFmt    = s3?.salary ? `${Number(s3.salary).toLocaleString()} ج.م` : '—';
  const schedule     = s4?.startTime && s4?.endTime ? `${s4.startTime} - ${s4.endTime}` : '—';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card padding="lg" className="space-y-6">

        {/* البيانات الأساسية */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'البيانات الأساسية' : 'Basic Data'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <ReviewField label={isAr ? 'الاسم الكامل'      : 'Full Name'}  value={s1?.fullName ?? ''} />
            <ReviewField label={isAr ? 'البريد الإلكتروني' : 'Email'}      value={s1?.email ?? ''} />
            <ReviewField label={isAr ? 'الهاتف'            : 'Phone'}      value={s1?.phone ?? '—'} />
            <ReviewField label={isAr ? 'القسم'             : 'Department'} value={deptLabel} />
            <ReviewField label={isAr ? 'المسمى الوظيفي'    : 'Job Title'}  value={titleLabel} />
            <ReviewField label={isAr ? 'تاريخ الالتحاق'    : 'Hire Date'}  value={s1?.hireDate ?? ''} />
            <ReviewField label={isAr ? 'المدير المباشر'     : 'Manager'}    value={managerLabel} />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* التوظيف والراتب */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'التوظيف والراتب' : 'Employment & Salary'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <ReviewField label={isAr ? 'نوع التوظيف'   : 'Job Type'} value={jobTypeLabel} />
            <ReviewField label={isAr ? 'الراتب'         : 'Salary'}   value={salaryFmt}   />
            <ReviewField label={isAr ? 'مواعيد الدوام' : 'Schedule'} value={schedule}    />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 p-4">
          <Mail size={15} className="text-[#709028] mt-0.5 shrink-0" />
          <p className="text-sm text-[#709028] leading-relaxed">
            {isAr
              ? 'عند الإرسال سيتم إنشاء الحساب بحالة «بانتظار التفعيل» وإرسال دعوة تفعيل إلى البريد الإلكتروني.'
              : 'Upon sending, the account will be created with "Pending Activation" status and an activation invite will be emailed.'}
          </p>
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isLast isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
