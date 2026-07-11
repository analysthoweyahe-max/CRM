import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import type { OrgSettings } from '../types/orgSettings.types';

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function WorkSettingsCard({ settings, onChange, isAr }: Props) {
  const windowFrom = settings.normalStartWindowFrom ?? settings.workStartTime ?? '10:00';
  const windowTo   = settings.normalStartWindowTo   ?? '12:00';

  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'إعدادات العمل' : 'Work Settings'}
      </h2>

      <FormField label={isAr ? 'نافذة البدء الطبيعي' : 'Normal Start Window'}>
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={windowFrom.slice(0, 5)}
            onChange={(e) => onChange('normalStartWindowFrom', e.target.value)}
          />
          <span className="text-gray-400 shrink-0">{isAr ? 'إلى' : 'to'}</span>
          <Input
            type="time"
            value={windowTo.slice(0, 5)}
            onChange={(e) => onChange('normalStartWindowTo', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {isAr
            ? 'تُستخدم لتصنيف الحضور (عادي / متأخر). الموظف يمكنه التسجيل في أي وقت والمؤقت يبدأ فوراً.'
            : 'Used to classify check-in (normal / late). Employees may check in anytime; the timer starts immediately.'}
        </p>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'عدد ساعات العمل اليومية' : 'Daily Work Hours'}>
          <Input type="number" min={1} value={settings.dailyWorkHours}
            onChange={(e) => onChange('dailyWorkHours', Number(e.target.value))} />
        </FormField>
        <FormField label={isAr ? 'مهلة التأخير (دقائق)' : 'Late Allowance (minutes)'}>
          <Input type="number" min={0} value={settings.lateAllowanceMinutes}
            onChange={(e) => onChange('lateAllowanceMinutes', Number(e.target.value))} />
        </FormField>
      </div>
    </Card>
  );
}
