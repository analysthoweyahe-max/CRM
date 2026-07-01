import { useState }                        from 'react';
import { User, Mail, Briefcase, Check }   from 'lucide-react';
import { toast }                           from 'sonner';
import { useAuth }                         from '@/modules/auth/context/AuthContext';
import { Card }                            from '@/shared/components/ui/Card';
import { Input }                           from '@/shared/components/ui/Input';
import { Button }                          from '@/shared/components/ui/Button';
import { FormField }                       from '@/shared/components/form/FormField';

interface Props { isAr: boolean }

export function SeoProfileInfoCard({ isAr }: Props) {
  const { user } = useAuth();

  const [name,   setName]   = useState(user?.fullName ?? '');
  const [email,  setEmail]  = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
  }

  return (
    <Card padding="lg">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5 text-end">
        {isAr ? 'المعلومات الشخصية' : 'Personal Info'}
      </h3>

      <form onSubmit={e => { e.preventDefault(); handleSave(); }} noValidate className="space-y-4">

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={isAr ? 'الاسم' : 'Name'}>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              endIcon={<User size={15} />}
              placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
              className="text-end"
            />
          </FormField>

          <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'}>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              dir="ltr"
              className={isAr ? 'text-right' : ''}
              endIcon={<Mail size={15} />}
              placeholder="name@company.com"
            />
          </FormField>
        </div>

        {/* Job title — read-only */}
        <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'}>
          <Input
            value={isAr ? 'قائد SEO' : 'SEO Leader'}
            readOnly
            disabled
            className="cursor-not-allowed text-end"
            endIcon={<Briefcase size={15} />}
          />
        </FormField>

        <div className="flex justify-end pt-1">
          <Button type="submit" isLoading={saving} startIcon={<Check size={15} />}>
            {isAr ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>

      </form>
    </Card>
  );
}
