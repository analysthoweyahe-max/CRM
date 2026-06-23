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
import { Step2Review }    from '../components/NewEmployeeForm/Steps3to5';
import type { AllFormData } from '../components/NewEmployeeForm/newEmployeeForm.types';

export function NewEmployeePage() {
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [step, setStep]         = useState(1);
  const [formData, setFormData] = useState<AllFormData>({});

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
          onNext={(d) => { setFormData({ step1: d }); setStep(2); }}
          onBack={() => navigate(ROUTES.EMPLOYEES.LIST)}
        />
      )}

      {step === 2 && (
        <Step2Review
          isAr={isAr} isRTL={isRTL}
          formData={formData}
          onBack={() => setStep(1)}
          onSubmit={handleFinalSubmit}
        />
      )}

    </div>
  );
}
