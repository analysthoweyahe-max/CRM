import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTES } from '@/app/router/routes';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import type { UpdateEmployeePasswordPayload } from '@/modules/hr/employees/types/employee.types';
import { extractApiError } from '@/shared/utils/error.utils';
import { toAdminEmployeeDetail } from '../types/adminEmployee.types';

export function useAdminEmployeeDetail(isAr: boolean) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin';

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'employees', 'detail', id],
    queryFn:  () => employeeApi.get(id!).then((r) => r.data.data),
    enabled:  !!id,
  });

  const employee = data ? toAdminEmployeeDetail(data) : undefined;

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

  return {
    employee,
    isLoading,
    isSuperAdmin,
    editEmployee: () => id && navigate(ROUTES.EMPLOYEES.EDIT(id)),
    passwordModalOpen,
    openPasswordModal,
    closePasswordModal,
    updatePassword,
    isUpdatingPassword: updatePasswordMutation.isPending,
    goBack: () => navigate(ROUTES.ADMIN.EMPLOYEES),
  };
}
