import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import type { OrgLeaveType, OrgSettings } from '../types/orgSettings.types';

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function LeavePolicyCard({ settings, onChange, isAr }: Props) {
  const leaveTypes = settings.leaveTypes ?? [];

  function updateLeaveType(value: string, patch: Partial<Pick<OrgLeaveType, 'labelEn' | 'labelAr' | 'tracksBalance'>>) {
    onChange(
      'leaveTypes',
      leaveTypes.map((t) => (t.value === value ? { ...t, ...patch } : t)),
    );
  }

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
        <FormField label={isAr ? 'الإجازة العرضية (يوم)' : 'Casual Leave (days)'}>
          <Input type="number" min={0} value={settings.casualLeave ?? 0}
            onChange={(e) => onChange('casualLeave', Number(e.target.value))} />
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

      <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isAr ? 'أنواع الإجازات' : 'Leave Types'}
          </h3>
          <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
            {isAr
              ? 'تعديل التسميات وتتبع الرصيد. المفتاح ثابت ولا يمكن تغييره.'
              : 'Edit labels and balance tracking. The key is fixed and cannot be changed.'}
          </p>
        </div>

        <div className="space-y-3">
          {leaveTypes.map((type) => (
            <div
              key={type.value}
              className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                  {type.value}
                </code>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {isAr ? 'تتبع الرصيد' : 'Tracks balance'}
                  </span>
                  <Switch
                    checked={type.tracksBalance}
                    onChange={() => updateLeaveType(type.value, { tracksBalance: !type.tracksBalance })}
                    ariaLabel={isAr ? 'تتبع الرصيد' : 'Tracks balance'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={isAr ? 'التسمية (إنجليزي)' : 'Label (English)'}>
                  <Input
                    value={type.labelEn}
                    onChange={(e) => updateLeaveType(type.value, { labelEn: e.target.value })}
                    dir="ltr"
                  />
                </FormField>
                <FormField label={isAr ? 'التسمية (عربي)' : 'Label (Arabic)'}>
                  <Input
                    value={type.labelAr}
                    onChange={(e) => updateLeaveType(type.value, { labelAr: e.target.value })}
                    dir="rtl"
                  />
                </FormField>
              </div>
            </div>
          ))}

          {leaveTypes.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
              {isAr ? 'لا توجد أنواع إجازات.' : 'No leave types available.'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
