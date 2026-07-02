import { useLang } from '@/app/providers/LanguageProvider';
import { EmployeeDetailHeader }  from '../components/EmployeeDetailHeader';
import { EmployeeStatCards }     from '../components/EmployeeStatCards';
import { SystemAccessCard }      from '../components/SystemAccessCard';
import { ActivityLogCard }       from '../components/ActivityLogCard';
import { PersonalInfoCard }      from '../components/PersonalInfoCard';
import { EmploymentInfoCard }    from '../components/EmploymentInfoCard';
import { CustomPermissionsCard } from '../components/CustomPermissionsCard';
import { EmployeeFormModal }     from '../components/EmployeeFormModal';
import { useAdminEmployeeDetail } from '../hooks/useAdminEmployeeDetail';
import { useAdminEmployees }      from '../hooks/useAdminEmployees';

export function AdminEmployeeDetailPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    employee, editInitial,
    showEdit, openEdit, closeEdit, saveEdit, resetPassword,
  } = useAdminEmployeeDetail(isAr);

  const { departmentOptions } = useAdminEmployees();

  if (!employee) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'الموظف غير موجود' : 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <EmployeeDetailHeader employee={employee} isAr={isAr} onEdit={openEdit} onResetPassword={resetPassword} />

      <EmployeeStatCards stats={employee.stats} isAr={isAr} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="space-y-5 lg:col-span-1">
          <SystemAccessCard employee={employee} isAr={isAr} />
          <ActivityLogCard activity={employee.activity} isAr={isAr} />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <PersonalInfoCard employee={employee} isAr={isAr} />
          <EmploymentInfoCard employee={employee} isAr={isAr} />
          <CustomPermissionsCard permissions={employee.customPermissions} isAr={isAr} />
        </div>
      </div>

      <EmployeeFormModal
        open={showEdit}
        onClose={closeEdit}
        departmentOptions={departmentOptions}
        onSubmit={saveEdit}
        initial={editInitial}
        isAr={isAr}
      />

    </div>
  );
}
