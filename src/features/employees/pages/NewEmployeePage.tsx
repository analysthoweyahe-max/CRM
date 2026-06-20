import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { Card }       from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { StepIndicator }  from '../components/NewEmployeeForm/StepWizard';
import { Step1BasicData } from '../components/NewEmployeeForm/Step1BasicData';
import { Step2JobType }   from '../components/NewEmployeeForm/Step2JobType';
import { Step3Salary, Step4Attendance, Step5Review } from '../components/NewEmployeeForm/Steps3to5';
import type { AllFormData } from '../components/NewEmployeeForm/newEmployeeForm.types';

export function NewEmployeePage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [step, setStep]         = useState(1);
  const [formData, setFormData] = useState<AllFormData>({});

  function go(n: number) { setStep(n); }

  async function handleFinalSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    console.log('New employee payload:', formData);
    toast.success(
      isAr
        ? 'تم إنشاء حساب الموظف وإرسال دعوة التفعيل'
        : 'Employee account created and activation invite sent',
    );
    navigate(ROUTES.EMPLOYEES.LIST);
  }

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'إضافة موظف جديد' : 'Add New Employee'}
        subtitle={isAr ? 'أنشئ حساب موظف وأرسل دعوة التفعيل' : 'Create an employee account and send an activation invitation'}
        start={
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate(ROUTES.EMPLOYEES.LIST)}
            className="p-2"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            <BackIcon size={18} />
          </Button>
        }
      />

      <Card padding="md">
        <StepIndicator current={step} isAr={isAr} />
      </Card>

      {step === 1 && (
        <Step1BasicData
          isAr={isAr} isRTL={isRTL}
          defaultValues={formData.step1}
          onNext={(d) => { setFormData((p) => ({ ...p, step1: d })); go(2); }}
          onBack={() => navigate(ROUTES.EMPLOYEES.LIST)}
        />
      )}

      {step === 2 && (
        <Step2JobType
          isAr={isAr} isRTL={isRTL}
          defaultValues={formData.step2}
          onNext={(d) => { setFormData((p) => ({ ...p, step2: d })); go(3); }}
          onBack={() => go(1)}
        />
      )}

      {step === 3 && (
        <Step3Salary
          isAr={isAr} isRTL={isRTL}
          jobType={formData.step2?.jobType}
          defaultValues={formData.step3}
          onNext={(d) => { setFormData((p) => ({ ...p, step3: d })); go(4); }}
          onBack={() => go(2)}
        />
      )}

      {step === 4 && (
        <Step4Attendance
          isAr={isAr} isRTL={isRTL}
          defaultValues={formData.step4}
          onNext={(d) => { setFormData((p) => ({ ...p, step4: d })); go(5); }}
          onBack={() => go(3)}
        />
      )}

      {step === 5 && (
        <Step5Review
          isAr={isAr} isRTL={isRTL}
          formData={formData}
          onBack={() => go(4)}
          onSubmit={handleFinalSubmit}
        />
      )}

    </div>
  );
}
