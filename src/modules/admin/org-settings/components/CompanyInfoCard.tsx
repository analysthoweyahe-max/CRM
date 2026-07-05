import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type { OrgSettings } from '../types/orgSettings.types';

const TIMEZONE_ITEMS = [
  { id: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'Asia/Riyadh',  label: 'توقيت الرياض (GMT+3)'  },
  { id: 'Asia/Dubai',   label: 'توقيت دبي (GMT+4)'      },
  { id: 'UTC',          label: 'UTC (GMT+0)'              },
];

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function CompanyInfoCard({ settings, onChange, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'معلومات الشركة' : 'Company Information'}
      </h2>

      <FormField label={isAr ? 'اسم الشركة' : 'Company Name'}>
        <Input value={settings.companyName} onChange={(e) => onChange('companyName', e.target.value)} />
      </FormField>

      <FormField label={isAr ? 'البريد الرسمي' : 'Official Email'}>
        <Input type="email" dir="ltr" value={settings.officialEmail}
          onChange={(e) => onChange('officialEmail', e.target.value)} />
      </FormField>

      <FormField label={isAr ? 'المنطقة الزمنية' : 'Timezone'}>
        <Combobox
          items={TIMEZONE_ITEMS}
          value={settings.timezone}
          onChange={(v) => onChange('timezone', v)}
          searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </FormField>
    </Card>
  );
}
