import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTES } from '@/app/router/routes';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { toAdminEmployeeDetail } from '../types/adminEmployee.types';

export function useAdminEmployeeDetail(isAr: boolean) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'employees', 'detail', id],
    queryFn:  () => employeeApi.get(id!).then((r) => r.data.data),
    enabled:  !!id,
  });

  const employee = data ? toAdminEmployeeDetail(data) : undefined;

  function resetPassword() {
    toast.success(isAr ? 'تم إرسال رابط إعادة تعيين كلمة المرور' : 'Password reset link sent');
  }

  return {
    employee, isLoading,
    editEmployee: () => id && navigate(ROUTES.EMPLOYEES.EDIT(id)),
    resetPassword,
    goBack: () => navigate(ROUTES.ADMIN.EMPLOYEES),
  };
}
