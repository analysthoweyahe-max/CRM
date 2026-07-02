import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type { OrgSettings } from '../types/orgSettings.types';

const DAYS = [
  { id: 'sun', ar: 'الأحد',     en: 'Sun' },
  { id: 'mon', ar: 'الإثنين',   en: 'Mon' },
  { id: 'tue', ar: 'الثلاثاء',  en: 'Tue' },
  { id: 'wed', ar: 'الأربعاء',  en: 'Wed' },
  { id: 'thu', ar: 'الخميس',    en: 'Thu' },
  { id: 'fri', ar: 'الجمعة',    en: 'Fri' },
  { id: 'sat', ar: 'السبت',     en: 'Sat' },
];

const TIMEZONE_ITEMS = [
  { id: 'riyadh', label: 'توقيت الرياض (GMT+3)' },
  { id: 'cairo',  label: 'توقيت القاهرة (GMT+2)' },
  { id: 'dubai',  label: 'توقيت دبي (GMT+4)' },
];

interface Props {
  settings:      OrgSettings;
  onToggleDay:   (day: string) => void;
  onChange:      <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:          boolean;
}

export function WorkSettingsCard({ settings, onToggleDay, onChange, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'إعدادات العمل' : 'Work Settings'}
      </h2>

      <FormField label={isAr ? 'أيام العمل' : 'Work Days'}>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => {
            const active = settings.workDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => onToggleDay(day.id)}
                className={[
                  'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                  active
                    ? 'bg-[#A0CD39] border-[#A0CD39] text-gray-900'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#A0CD39]',
                ].join(' ')}
              >
                {isAr ? day.ar : day.en}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label={isAr ? 'ساعات العمل' : 'Work Hours'}>
        <div className="flex items-center gap-2">
          <Input type="time" value={settings.workStart} onChange={e => onChange('workStart', e.target.value)} />
          <span className="text-gray-400 shrink-0">{isAr ? 'إلى' : 'to'}</span>
          <Input type="time" value={settings.workEnd} onChange={e => onChange('workEnd', e.target.value)} />
        </div>
      </FormField>

      <FormField label={isAr ? 'المنطقة الزمنية' : 'Timezone'}>
        <Combobox
          items={TIMEZONE_ITEMS}
          value={settings.timezone}
          onChange={v => onChange('timezone', v)}
          searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </FormField>
    </Card>
  );
}
