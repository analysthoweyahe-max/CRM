import { useForm }    from 'react-hook-form';
import { User, Mail, Phone, Briefcase, Check } from 'lucide-react';
import { toast }      from 'sonner';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { EMPLOYEES }  from '@/features/employees/data/employeeData';
import { Card }       from '@/shared/components/ui/Card';
import { Input }      from '@/shared/components/ui/Input';
import { Button }     from '@/shared/components/ui/Button';
import { FormField }  from '@/shared/components/form/FormField';

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
    // TODO: await api.put('/profile', data)
    console.log('profile update:', data);
    toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
  }

  const jobTitle = isAr ? (emp?.jobTitle ?? '—') : (emp?.jobTitleEn ?? '—');

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold" style={{ color: '#302F33' }}>
          {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Full name */}
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

          {/* Email */}
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

          {/* Phone — numbers right, icon left in Arabic */}
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

          {/* Job title — readonly */}
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
    </Card>
  );
}
