import { useNavigate } from 'react-router-dom';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card }       from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ShieldCheck } from 'lucide-react';
import { RoleCard }   from '../components/RoleCard';
import { useRoleList } from '../hooks/useRoles';

export function AdminEmployeeRolesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const { data: roles = [], isLoading } = useRoleList('employee');

  return (
    <div className="space-y-6">

      <PageHeader
        title={isAr ? 'أدوار الموظفين' : 'Employee Roles'}
        subtitle={isAr
          ? 'تحديد صلاحيات كل دور من أدوار الموظفين (يُعيَّن تلقائياً حسب القسم)'
          : 'Configure what each employee role can do (assigned automatically by department)'}
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : roles.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<ShieldCheck size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
            title={isAr ? 'لا توجد أدوار بعد' : 'No roles yet'}
            description={isAr
              ? 'لم يتم إنشاء أدوار الموظفين بعد على الخادم'
              : 'Employee-guard roles haven\'t been seeded on the server yet'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isAr={isAr}
              isLocked={false}
              onEdit={() => navigate(ROUTES.ADMIN.EMPLOYEE_ROLES_EDIT(String(role.id)))}
            />
          ))}
        </div>
      )}

    </div>
  );
}
