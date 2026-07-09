import { useLang } from '@/app/providers/LanguageProvider';
import { EmployeeDetailHeader }  from '../components/EmployeeDetailHeader';
import { EmployeeStatCards }     from '../components/EmployeeStatCards';
import { SystemAccessCard }      from '../components/SystemAccessCard';
import { ActivityLogCard }       from '../components/ActivityLogCard';
import { PersonalInfoCard }      from '../components/PersonalInfoCard';
import { EmploymentInfoCard }    from '../components/EmploymentInfoCard';
import { EmployeeRolesCard }     from '../components/EmployeeRolesCard';
import { UpdateEmployeePasswordModal } from '../components/UpdateEmployeePasswordModal';
import { useAdminEmployeeDetail } from '../hooks/useAdminEmployeeDetail';

export function AdminEmployeeDetailPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    employee,
    isLoading,
    isSuperAdmin,
    editEmployee,
    passwordModalOpen,
    openPasswordModal,
    closePasswordModal,
    updatePassword,
    isUpdatingPassword,
    canAssignRole,
    availableRoles,
    roleModalOpen,
    openRoleModal,
    closeRoleModal,
    assignEmployeeRole,
    assigningRole,
  } = useAdminEmployeeDetail(isAr);

  if (isLoading) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'الموظف غير موجود' : 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <EmployeeDetailHeader
        employee={employee}
        isAr={isAr}
        isSuperAdmin={isSuperAdmin}
        onEdit={editEmployee}
        onUpdatePassword={openPasswordModal}
      />

      <UpdateEmployeePasswordModal
        open={passwordModalOpen}
        employee={employee ? { name: employee.name, email: employee.email } : undefined}
        isAr={isAr}
        isLoading={isUpdatingPassword}
        onClose={closePasswordModal}
        onSubmit={updatePassword}
      />

      <EmployeeStatCards stats={employee.stats} isAr={isAr} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="space-y-5 lg:col-span-1">
          <SystemAccessCard employee={employee} isAr={isAr} isSuperAdmin={isSuperAdmin} />
          <ActivityLogCard activity={employee.activity} isAr={isAr} />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <PersonalInfoCard employee={employee} isAr={isAr} />
          <EmploymentInfoCard employee={employee} isAr={isAr} />
          <EmployeeRolesCard
            roles={employee.roles}
            isAr={isAr}
            canAssign={canAssignRole}
            availableRoles={availableRoles}
            modalOpen={roleModalOpen}
            isAssigning={assigningRole}
            onOpenAssign={openRoleModal}
            onCloseAssign={closeRoleModal}
            onAssign={assignEmployeeRole}
          />
        </div>
      </div>

    </div>
  );
}
