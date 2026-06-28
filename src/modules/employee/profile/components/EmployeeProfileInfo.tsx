import { User, Mail, Phone, Briefcase, Building2, Check } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Input }     from '@/shared/components/ui/Input';
import { Button }    from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { useEmployeeProfileInfo } from './useEmployeeProfileInfo';
import type { EmployeeProfileInfoProps } from './EmployeeProfileInfo.types';

export function EmployeeProfileInfo({ isAr }: EmployeeProfileInfoProps) {
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    jobTitle, dept,
    saving, handleSave,
  } = useEmployeeProfileInfo(isAr);

  return (
    <Card padding="lg">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">
        {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
      </h3>

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
    </Card>
  );
}
