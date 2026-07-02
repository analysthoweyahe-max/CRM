import { Card }      from '@/shared/components/ui/Card';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type { OrgSettings } from '../types/orgSettings.types';

const INVITE_METHOD_ITEMS = [
  { id: 'email', label: 'دعوة عبر البريد الإلكتروني' },
  { id: 'link',  label: 'رابط دعوة مشترك' },
];

const DEPARTMENT_ITEMS = [
  { id: 'التطوير',         label: 'التطوير'         },
  { id: 'التصميم',         label: 'التصميم'         },
  { id: 'التسويق',         label: 'التسويق'         },
  { id: 'الموارد البشرية', label: 'الموارد البشرية' },
  { id: 'الدعم الفني',     label: 'الدعم الفني'     },
];

const ROLE_ITEMS = [
  { id: 'employee', label: 'موظف'        },
  { id: 'manager',  label: 'مدير مشاريع' },
  { id: 'hr',       label: 'HR'          },
];

interface Props {
  settings: OrgSettings;
  onChange: <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => void;
  isAr:     boolean;
}

export function EmployeeDefaultsCard({ settings, onChange, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'افتراضيات الموظفين' : 'Employee Defaults'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={isAr ? 'طريقة دعوة الموظفين الجدد' : 'New Employee Invite Method'}>
          <Combobox
            items={INVITE_METHOD_ITEMS}
            value={settings.inviteMethod}
            onChange={v => onChange('inviteMethod', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'القسم الافتراضي' : 'Default Department'}>
          <Combobox
            items={DEPARTMENT_ITEMS}
            value={settings.defaultDepartment}
            onChange={v => onChange('defaultDepartment', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'الدور الافتراضي' : 'Default Role'}>
          <Combobox
            items={ROLE_ITEMS}
            value={settings.defaultRole}
            onChange={v => onChange('defaultRole', v)}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>
      </div>
    </Card>
  );
}
