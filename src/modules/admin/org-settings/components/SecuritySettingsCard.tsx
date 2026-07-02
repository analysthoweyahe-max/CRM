import { Card }      from '@/shared/components/ui/Card';
import { Switch }    from '@/shared/components/ui/Switch';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type { OrgSettings } from '../types/orgSettings.types';

const PASSWORD_POLICY_ITEMS = [
  { id: 'strong', label: 'قوية – 8 أحرف على الأقل' },
  { id: 'medium', label: 'متوسطة – 6 أحرف على الأقل' },
  { id: 'basic',  label: 'أساسية – 4 أحرف على الأقل' },
];

const SESSION_TIMEOUT_ITEMS = [
  { id: '15',  label: '15 دقيقة' },
  { id: '30',  label: '30 دقيقة' },
  { id: '60',  label: 'ساعة واحدة' },
  { id: '480', label: '8 ساعات' },
];

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function SecuritySettingsCard({ settings, onChange, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'إعدادات الأمان' : 'Security Settings'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isAr ? 'سياسة كلمة المرور' : 'Password Policy'}>
          <Combobox
            items={PASSWORD_POLICY_ITEMS}
            value={settings.passwordPolicy}
            onChange={v => onChange('passwordPolicy', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'مهلة انتهاء الجلسة' : 'Session Timeout'}>
          <Combobox
            items={SESSION_TIMEOUT_ITEMS}
            value={settings.sessionTimeout}
            onChange={v => onChange('sessionTimeout', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        <Switch
          checked={settings.twoFactorEnabled}
          onChange={() => onChange('twoFactorEnabled', !settings.twoFactorEnabled)}
          ariaLabel={isAr ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
        />
        <div className="text-end">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {isAr ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication (2FA)'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {isAr
              ? 'طلب رمز تحقق إضافي عند تسجيل الدخول لجميع المستخدمين'
              : 'Require an extra verification code on login for all users'}
          </p>
        </div>
      </div>
    </Card>
  );
}
