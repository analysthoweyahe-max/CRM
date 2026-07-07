import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { NavButtons } from './StepWizard';
import type { AllFormData } from './newEmployeeForm.types';
import { useDepartments, useJobTitles, useEmploymentTypes, useManagerOptions } from '../../hooks/useLookups';

interface Step2Props {
  isAr:     boolean;
  isRTL:    boolean;
  formData: AllFormData;
  onBack:   () => void;
  onSubmit: () => Promise<void>;
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{value || '—'}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
    </div>
  );
}

export function Step2Review({ isAr, isRTL, formData, onBack, onSubmit }: Step2Props) {
  const { handleSubmit, formState: { isSubmitting } } = useForm();
  const { data: employmentTypes = [] } = useEmploymentTypes();

  const s1 = formData.step1;

  const { data: departments = [] } = useDepartments();
  const { data: jobTitles   = [] } = useJobTitles(s1?.department || undefined);
  const { items: managerItems }    = useManagerOptions(isAr);

  const deptLabel    = departments.find((d) => String(d.id) === s1?.department)
    ?.[isAr ? 'nameAr' : 'name'] || s1?.department || '—';
  const titleLabel   = jobTitles.find((t) => String(t.id) === s1?.jobTitle)
    ?.[isAr ? 'nameAr' : 'name'] || s1?.jobTitle || '—';
  const managerLabel = !s1?.managerId || s1.managerId === 'none'
    ? (isAr ? 'بدون' : 'None')
    : (managerItems.find((m) => m.id === s1.managerId)?.label ?? '—');
  const jobTypeLabel = employmentTypes.find((t) => t.value === s1?.jobType)?.label ?? s1?.jobType ?? '—';
  const salaryFmt    = s1?.salary ? `${Number(s1.salary).toLocaleString()} ${s1.currency ?? 'EGP'}` : '—';
  const schedule     = s1?.startTime && s1?.endTime ? `${s1.startTime} - ${s1.endTime}` : '—';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card padding="lg" className="space-y-6">

        {/* البيانات الأساسية */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'البيانات الأساسية' : 'Basic Data'}
          </h3>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4
                          grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <ReviewField label={isAr ? 'الاسم الكامل'      : 'Full Name'}   value={s1?.fullName  ?? ''} />
            <ReviewField label={isAr ? 'البريد الإلكتروني' : 'Email'}       value={s1?.email     ?? ''} />
            <ReviewField label={isAr ? 'الهاتف'            : 'Phone'}       value={s1?.phone     ?? '—'} />
            <ReviewField label={isAr ? 'القسم'             : 'Department'}  value={deptLabel} />
            <ReviewField label={isAr ? 'المسمى الوظيفي'    : 'Job Title'}   value={titleLabel} />
            <ReviewField label={isAr ? 'تاريخ الالتحاق'    : 'Hire Date'}   value={s1?.hireDate  ?? ''} />
            <ReviewField label={isAr ? 'المدير المباشر'     : 'Manager'}     value={managerLabel} />
          </div>
        </div>

        {/* التوظيف والراتب */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'التوظيف والراتب' : 'Employment & Salary'}
          </h3>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4
                          grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <ReviewField label={isAr ? 'نوع التوظيف'   : 'Job Type'}  value={jobTypeLabel} />
            <ReviewField label={isAr ? 'الراتب'         : 'Salary'}    value={salaryFmt}    />
            <ReviewField label={isAr ? 'مواعيد الدوام' : 'Schedule'}  value={schedule}     />
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
