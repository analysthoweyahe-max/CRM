import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ROUTES } from '@/app/router/routes';
import { getEmployee, updateEmployee, useEmployees } from '../store/adminEmployeeStore';
import { MANAGER_ITEMS } from '../data/employeeData';
import type { NewAdminEmployeeInput } from '../types/adminEmployee.types';

export function useAdminEmployeeDetail(isAr: boolean) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  useEmployees(); // subscribe so this hook re-renders when the store changes
  const employee = id ? getEmployee(id) : undefined;

  const editInitial: NewAdminEmployeeInput | undefined = employee ? {
    fullName:      employee.name,
    email:         employee.email,
    phone:         employee.phone,
    address:       employee.address,
    jobTitle:      employee.jobTitle,
    department:    employee.department,
    managerId:     MANAGER_ITEMS.find(m => m.label === employee.managerName)?.id ?? '',
    joiningDate:   '',
    role:          employee.role,
    accountStatus: employee.statusLabelAr,
  } : undefined;

  function saveEdit(input: NewAdminEmployeeInput) {
    if (!employee) return;
    updateEmployee(employee.id, {
      name:          input.fullName,
      email:         input.email,
      phone:         input.phone,
      address:       input.address,
      jobTitle:      input.jobTitle,
      department:    input.department || employee.department,
      managerName:   MANAGER_ITEMS.find(m => m.id === input.managerId)?.label ?? employee.managerName,
      role:          input.role,
      status:        input.accountStatus === 'نشط' ? 'active' : 'disabled',
      statusLabelAr: input.accountStatus,
      statusLabelEn: input.accountStatus === 'نشط' ? 'Active' : 'Disabled',
    });
    toast.success(isAr ? 'تم تحديث بيانات الموظف' : 'Employee updated');
    setShowEdit(false);
  }

  function resetPassword() {
    toast.success(isAr ? 'تم إرسال رابط إعادة تعيين كلمة المرور' : 'Password reset link sent');
  }

  return {
    employee, editInitial,
    showEdit, openEdit: () => setShowEdit(true), closeEdit: () => setShowEdit(false),
    saveEdit, resetPassword,
    goBack: () => navigate(ROUTES.ADMIN.EMPLOYEES),
  };
}
