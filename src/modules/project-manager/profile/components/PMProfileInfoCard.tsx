import { useState }   from 'react';
import { User, Mail, Briefcase, Check, FileText } from 'lucide-react';
import { toast }      from 'sonner';
import { useAuth }    from '@/modules/auth/context/AuthContext';
import { EMPLOYEES }  from '@/modules/hr/employees/data/employeeData';
import { Card }       from '@/shared/components/ui/Card';
import { Input }      from '@/shared/components/ui/Input';
import { Button }     from '@/shared/components/ui/Button';
import { FormField }  from '@/shared/components/form/FormField';
import { isSuperAdminUser } from '@/shared/utils/authPermissions.utils';
import { ProfileContractTab } from '@/modules/hr/profile/components/ProfileContractTab';

interface Props { isAr: boolean }

type Tab = 'info' | 'contract';

export function PMProfileInfoCard({ isAr }: Props) {
  const { user } = useAuth();
  const emp      = EMPLOYEES.find(e => e.id === user?.employeeId);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const [name,    setName]    = useState(user?.fullName ?? '');
  const [email,   setEmail]   = useState(emp?.email ?? '');
  const [saving,  setSaving]  = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
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
          <FormField
            label={isAr ? 'الاسم' : 'Name'}
            icon={<User size={14} className="text-gray-400" />}
          >
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              endIcon={<User size={15} />}
              placeholder={isAr ? 'الاسم الكامل' : 'Full name'}
            />
          </FormField>

          <FormField
            label={isAr ? 'البريد الإلكتروني' : 'Email'}
            icon={<Mail size={14} className="text-gray-400" />}
          >
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

        <FormField
          label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
          icon={<Briefcase size={14} className="text-gray-400" />}
        >
          <Input
            value={isAr ? 'مدير مشاريع' : 'Project Manager'}
            readOnly
            disabled
            className="cursor-not-allowed"
            endIcon={<Briefcase size={15} />}
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
