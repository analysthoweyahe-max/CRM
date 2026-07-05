import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import type { OrgSettings } from '../types/orgSettings.types';

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function LeavePolicyCard({ settings, onChange, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'سياسة الإجازات' : 'Leave Policy'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'الإجازة السنوية (يوم)' : 'Annual Leave (days)'}>
          <Input type="number" min={0} value={settings.annualLeave}
            onChange={(e) => onChange('annualLeave', Number(e.target.value))} />
        </FormField>
        <FormField label={isAr ? 'الإجازة المرضية (يوم)' : 'Sick Leave (days)'}>
          <Input type="number" min={0} value={settings.sickLeave}
            onChange={(e) => onChange('sickLeave', Number(e.target.value))} />
        </FormField>
        <FormField label={isAr ? 'الحد الأقصى للترحيل (يوم)' : 'Max Carryover (days)'}>
          <Input type="number" min={0} value={settings.maxCarryover}
            onChange={(e) => onChange('maxCarryover', Number(e.target.value))} />
        </FormField>
        <FormField label={isAr ? 'التنبيه قبل الانتهاء (يوم)' : 'Notify Before (days)'}>
          <Input type="number" min={0} value={settings.notifyBeforeDays}
            onChange={(e) => onChange('notifyBeforeDays', Number(e.target.value))} />
        </FormField>
      </div>
    </Card>
  );
}
