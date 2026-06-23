import { useState }    from 'react';
import { useForm }    from 'react-hook-form';
import { User, Mail, Phone, Briefcase, Check, FileText } from 'lucide-react';
import { toast }      from 'sonner';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { EMPLOYEES }  from '@/modules/hr/employees/data/employeeData';
import { Card }       from '@/shared/components/ui/Card';
import { Input }      from '@/shared/components/ui/Input';
import { Button }     from '@/shared/components/ui/Button';
import { FormField }  from '@/shared/components/form/FormField';
import { ProfileContractTab } from './ProfileContractTab';

type Tab = 'info' | 'contract';

interface ProfileFormValues {
  fullName: string;
  email:    string;
  phone:    string;
}

interface Props {
  user: AuthUser;
  isAr: boolean;
}

export function ProfileInfoCard({ user, isAr }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const emp = EMPLOYEES.find((e) => e.id === user.employeeId);

  const { register, handleSubmit, formState: { isSubmitting } } =
    useForm<ProfileFormValues>({
      defaultValues: {
        fullName: user.fullName,
        email:    emp?.email ?? '',
        phone:    emp?.phone ?? '',
      },
    });

  async function onSubmit(data: ProfileFormValues) {
    await new Promise((r) => setTimeout(r, 500));
    console.log('profile update:', data);
    toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
  }

  const jobTitle = isAr ? (emp?.jobTitle ?? '—') : (emp?.jobTitleEn ?? '—');

  const tabs: { key: Tab; labelAr: string; labelEn: string; icon: React.ReactElement }[] = [
    { key: 'info',     labelAr: 'المعلومات الشخصية', labelEn: 'Personal Info', icon: <User size={14} />     },
    { key: 'contract', labelAr: 'عقد العمل',          labelEn: 'Contract',      icon: <FileText size={14} /> },
  ];

  return (
    <Card padding="lg">

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-100 dark:border-gray-700 -mt-1 pb-0">
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

      {/* Tab content */}
      {activeTab === 'info' && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField
              label={isAr ? 'الاسم الكامل' : 'Full Name'}
              icon={<User size={15} className="text-gray-400" />}
            >
              <Input
                {...register('fullName')}
                endIcon={<User size={15} />}
                placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
              />
            </FormField>

            <FormField
              label={isAr ? 'البريد الإلكتروني' : 'Email'}
              icon={<Mail size={15} className="text-gray-400" />}
            >
              <Input
                {...register('email')}
                type="email"
                dir="ltr"
                className={isAr ? 'text-right' : ''}
                endIcon={<Mail size={15} />}
                placeholder="name@company.com"
              />
            </FormField>

            <FormField
              label={isAr ? 'رقم الهاتف' : 'Phone'}
              icon={<Phone size={15} className="text-gray-400" />}
            >
              <Input
                {...register('phone')}
                type="tel"
                dir={isAr ? 'rtl' : 'ltr'}
                className={isAr ? 'text-right' : ''}
                endIcon={<Phone size={15} />}
                placeholder="01xxxxxxxx"
              />
            </FormField>

            <FormField
              label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
              icon={<Briefcase size={15} className="text-gray-400" />}
            >
              <Input
                value={jobTitle}
                readOnly
                disabled
                className="cursor-not-allowed"
                endIcon={<Briefcase size={15} />}
              />
            </FormField>

          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
              {isAr ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'contract' && (
        <ProfileContractTab user={user} isAr={isAr} />
      )}

    </Card>
  );
}
