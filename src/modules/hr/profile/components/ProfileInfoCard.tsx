import { useState }    from 'react';
import { useForm }    from 'react-hook-form';
import { User, Mail, Phone, Check, FileText } from 'lucide-react';
import { toast }      from 'sonner';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import { extractApiError } from '@/shared/utils/error.utils';
import { isSuperAdminUser } from '@/shared/utils/authPermissions.utils';
import { Card }       from '@/shared/components/ui/Card';
import { Input }      from '@/shared/components/ui/Input';
import { Button }     from '@/shared/components/ui/Button';
import { FormField }  from '@/shared/components/form/FormField';
import { ProfileContractTab } from './ProfileContractTab';

type Tab = 'info' | 'contract';

interface ProfileFormValues {
  fullName: string;
  email:    string;
  phone?:    string;
}

interface Props {
  user: AuthUser;
  isAr: boolean;
}

export function ProfileInfoCard({ user, isAr }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { refreshUser } = useAuth();

  const { register, handleSubmit, formState: { isSubmitting, errors } } =
    useForm<ProfileFormValues>({
      defaultValues: {
        fullName: user.fullName,
        email:    user.email ?? '',
        phone:    user.phone ?? '',
      },
    });

  async function onSubmit(data: ProfileFormValues) {
    try {
      await authService.updateProfile({
        name:  data.fullName,
        email: data.email,
        phone: data.phone ?? '',
      });
      await refreshUser();
      toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  const tabs: { key: Tab; labelAr: string; labelEn: string; icon: React.ReactElement }[] = [
    { key: 'info',     labelAr: 'المعلومات الشخصية', labelEn: 'Personal Info', icon: <User size={14} />     },
    ...(isSuperAdminUser(user)
      ? []
      : [{ key: 'contract' as const, labelAr: 'عقد العمل', labelEn: 'Contract', icon: <FileText size={14} /> }]),
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
              error={errors.fullName?.message}
            >
              <Input
                {...register('fullName', {
                  required: isAr ? 'الاسم مطلوب' : 'Name is required',
                })}
                endIcon={<User size={15} />}
                placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
              />
            </FormField>

            <FormField
              label={isAr ? 'البريد الإلكتروني' : 'Email'}
              icon={<Mail size={15} className="text-gray-400" />}
              error={errors.email?.message}
            >
              <Input
                {...register('email', {
                  required: isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                  pattern: {
                    value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: isAr ? 'بريد إلكتروني غير صالح' : 'Invalid email address',
                  },
                })}
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
              error={errors.phone?.message}
            >
              <Input
                {...register('phone', {
                  required: isAr ? 'رقم الهاتف مطلوب' : 'Phone is required',
                })}
                type="tel"
                dir={isAr ? 'rtl' : 'ltr'}
                className={isAr ? 'text-right' : ''}
                endIcon={<Phone size={15} />}
                placeholder="01xxxxxxxx"
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
