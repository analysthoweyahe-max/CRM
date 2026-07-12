import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTES } from '@/app/router/routes';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { usePermission } from '@/shared/hooks/usePermission';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import type { UpdateEmployeePasswordPayload, AssignEmployeeRolePayload } from '@/modules/hr/employees/types/employee.types';
import { extractApiError } from '@/shared/utils/error.utils';
import { toAdminEmployeeDetail } from '../types/adminEmployee.types';
import { useAssignEmployeeRole } from './useAssignEmployeeRole';
import { useEmployeeAssignableRoles } from './useEmployeeAssignableRoles';

export function useAdminEmployeeDetail(isAr: boolean) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const canAssignRole = usePermission('assign-role');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen]         = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'employees', 'detail', id],
    queryFn:  () => employeeApi.get(id!).then((r) => r.data.data),
    enabled:  !!id,
  });

  const employee = data ? toAdminEmployeeDetail(data) : undefined;

  // No exclusion list: the employee's current role must stay selectable so the
  // "Change Role" dropdown can default to it (see AssignRoleModal initialRole).
  const { availableRoles } = useEmployeeAssignableRoles();
  const { mutate: assignRole, isPending: assigningRole } = useAssignEmployeeRole();

  const updatePasswordMutation = useMutation({
    mutationFn: (payload: UpdateEmployeePasswordPayload) =>
      employeeApi.updatePassword(id!, payload),
    onSuccess: () => {
      toast.success(isAr ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setPasswordModalOpen(false);
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });

  function openPasswordModal() {
    if (!isSuperAdmin || !id) return;
    setPasswordModalOpen(true);
  }

  function closePasswordModal() {
    if (updatePasswordMutation.isPending) return;
    setPasswordModalOpen(false);
  }

  function updatePassword(payload: UpdateEmployeePasswordPayload) {
    if (!id || updatePasswordMutation.isPending) return;
    updatePasswordMutation.mutate(payload);
  }

  function assignEmployeeRole(payload: AssignEmployeeRolePayload) {
    if (!id || assigningRole) return;
    assignRole({ id, payload }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تعيين الدور بنجاح' : 'Role assigned successfully');
        setRoleModalOpen(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function resetRoleToDepartmentDefault() {
    if (!id || assigningRole) return;
    assignRole({ id, payload: { sync_role_from_department: true } }, {
      onSuccess: () => {
        toast.success(isAr ? 'تمت إعادة الضبط حسب القسم' : 'Reset to department default');
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    employee,
    isLoading,
    isSuperAdmin,
    canAssignRole,
    availableRoles,
    roleModalOpen,
    openRoleModal:  () => setRoleModalOpen(true),
    closeRoleModal: () => setRoleModalOpen(false),
    assignEmployeeRole,
    resetRoleToDepartmentDefault,
    assigningRole,
    editEmployee: () => id && navigate(ROUTES.EMPLOYEES.EDIT(id)),
    passwordModalOpen,
    openPasswordModal,
    closePasswordModal,
    updatePassword,
    isUpdatingPassword: updatePasswordMutation.isPending,
    goBack: () => navigate(ROUTES.ADMIN.EMPLOYEES),
  };
}
