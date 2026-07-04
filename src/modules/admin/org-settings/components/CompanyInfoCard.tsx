import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import type { OrgSettings } from '../types/orgSettings.types';

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

      <FormField label={isAr ? 'شعار الشركة' : 'Company Logo'}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt={isAr ? 'شعار الشركة' : 'Company logo'} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <Button variant="secondary" size="sm">{isAr ? 'تغيير الشعار' : 'Change Logo'}</Button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? 'يفضل 512×512 بكسل، SVG أو PNG' : 'Preferably 512×512px, SVG or PNG'}
            </p>
          </div>
        </div>
      </FormField>

      <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'}>
        <Input type="email" value={settings.companyEmail} onChange={e => onChange('companyEmail', e.target.value)} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'رقم الهاتف' : 'Phone Number'}>
          <Input dir="ltr" value={settings.companyPhone} onChange={e => onChange('companyPhone', e.target.value)} />
        </FormField>
        <FormField label={isAr ? 'الموقع الإلكتروني' : 'Website'}>
          <Input dir="ltr" value={settings.companyWebsite} onChange={e => onChange('companyWebsite', e.target.value)} />
        </FormField>
      </div>

      <FormField label={isAr ? 'العنوان' : 'Address'}>
        <Input value={settings.companyAddress} onChange={e => onChange('companyAddress', e.target.value)} />
      </FormField>

      <FormField label={isAr ? 'اسم الشركة' : 'Company Name'}>
        <Input value={settings.companyName} onChange={e => onChange('companyName', e.target.value)} />
      </FormField>
    </Card>
  );
}
