import { useState } from 'react';
import { User, Mail, Phone, Briefcase, Building2, Check, FileText } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { useAuth }   from '@/modules/auth/context/AuthContext';
import { isSuperAdminUser } from '@/shared/utils/authPermissions.utils';
import { ProfileContractTab } from '@/modules/hr/profile/components/ProfileContractTab';
import { useEmployeeProfileInfo } from './useEmployeeProfileInfo';
import type { EmployeeProfileInfoProps } from './EmployeeProfileInfo.types';

type Tab = 'info' | 'contract';

export function EmployeeProfileInfo({ isAr }: EmployeeProfileInfoProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    jobTitle, dept,
    saving, handleSave,
  } = useEmployeeProfileInfo(isAr);

  const tabs: { key: Tab; labelAr: string; labelEn: string; icon: React.ReactElement }[] = [
    { key: 'info',     labelAr: 'المعلومات الشخصية', labelEn: 'Personal Info', icon: <User size={14} />     },
    ...(isSuperAdminUser(user)
      ? []
      : [{ key: 'contract' as const, labelAr: 'عقد العمل', labelEn: 'Contract', icon: <FileText size={14} /> }]),
  ];

  return (
    <Card padding="lg">

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-gray-100 dark:border-gray-700 -mt-1 pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
                isActive
                  ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              ].join(' ')}
            >
              {tab.icon}
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          );
        })}
      </div>

      {activeTab === 'contract' && user && (
        <ProfileContractTab user={user} isAr={isAr} />
      )}

      {activeTab === 'info' && (
      <form onSubmit={handleSave} noValidate className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم' : 'Name'} icon={<User size={14} className="text-gray-400" />}>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
              endIcon={<User size={15} />}
            />
          </FormField>

          <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} icon={<Mail size={14} className="text-gray-400" />}>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              dir="ltr"
              className={isAr ? 'text-right' : ''}
              placeholder="name@company.com"
              endIcon={<Mail size={15} />}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'رقم الهاتف' : 'Phone'} icon={<Phone size={14} className="text-gray-400" />}>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              dir="ltr"
              className={isAr ? 'text-right' : ''}
              placeholder="+20 xxx xxx xxxx"
              endIcon={<Phone size={15} />}
            />
          </FormField>

          <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} icon={<Briefcase size={14} className="text-gray-400" />}>
            <Input
              value={jobTitle}
              readOnly
              disabled
              className="cursor-not-allowed"
              endIcon={<Briefcase size={15} />}
            />
          </FormField>
        </div>

        <FormField label={isAr ? 'القسم' : 'Department'} icon={<Building2 size={14} className="text-gray-400" />}>
          <Input
            value={dept}
            readOnly
            disabled
            className="cursor-not-allowed"
            endIcon={<Building2 size={15} />}
          />
        </FormField>

        <div className="pt-1">
          <Button type="submit" isLoading={saving} startIcon={<Check size={15} />}>
            {isAr ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>

      </form>
      )}
    </Card>
  );
}
