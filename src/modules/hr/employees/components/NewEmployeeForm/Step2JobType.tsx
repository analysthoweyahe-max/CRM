import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/shared/components/ui/Card';
import { NavButtons } from './StepWizard';
import {
  step2Schema, EMPLOYMENT_TYPE_ICONS, DEFAULT_EMPLOYMENT_TYPE_ICON, EMPLOYMENT_TYPE_DESCRIPTIONS,
  type Step2Values,
} from './newEmployeeForm.types';
import { useEmploymentTypes } from '../../hooks/useLookups';

interface Step2Props {
  isAr:           boolean;
  isRTL:          boolean;
  defaultValues?: Partial<Step2Values>;
  onNext:         (d: Step2Values) => void;
  onBack:         () => void;
}

export function Step2JobType({ isAr, isRTL, defaultValues, onNext, onBack }: Step2Props) {
  const { data: employmentTypes = [] } = useEmploymentTypes();

  const { setValue, handleSubmit, formState: { isSubmitting } } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { jobType: '', ...defaultValues },
  });

  const [selected, setSelected] = useState<Step2Values['jobType']>(defaultValues?.jobType ?? '');

  // Default to the first employment type once the lookup loads, if nothing was chosen yet
  useEffect(() => {
    if (!selected && employmentTypes.length > 0) {
      handleSelect(employmentTypes[0].value);
    }
  }, [employmentTypes]);

  function handleSelect(id: Step2Values['jobType']) {
    setSelected(id);
    setValue('jobType', id);
  }

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Card padding="lg" className="space-y-5">

        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {isAr ? 'اختر نوع التوظيف المناسب للموظف:' : 'Choose the appropriate employment type:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {employmentTypes.map(({ value, label }) => {
            const isSelected = selected === value;
            const Icon       = EMPLOYMENT_TYPE_ICONS[value] ?? DEFAULT_EMPLOYMENT_TYPE_ICON;
            const desc       = EMPLOYMENT_TYPE_DESCRIPTIONS[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                className={[
                  'flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-center transition-all',
                  isSelected
                    ? 'border-[#A0CD39] bg-[#A0CD39]/10 dark:bg-[#A0CD39]/5'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-[#A0CD39] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
                  ].join(' ')}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {label}
                  </p>
                  {desc && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                      {isAr ? desc.ar : desc.en}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <NavButtons isAr={isAr} isRTL={isRTL} onBack={onBack} isSubmitting={isSubmitting} />
      </Card>
    </form>
  );
}
