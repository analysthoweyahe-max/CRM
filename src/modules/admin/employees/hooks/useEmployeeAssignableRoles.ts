import { useMemo } from 'react';
import { useRoleList } from '@/modules/admin/roles/hooks/useRoles';
import { assignableRoles } from '@/modules/admin/roles/utils/role.utils';
import type { ApiRole } from '@/modules/admin/roles/types/adminRole.types';

const EMPLOYEE_ROLE_FALLBACK: ApiRole[] = [
  {
    id:          -1,
    name:        'pm-employee',
    guardName:   'employee',
    permissions: ['view-pm-projects', 'view-pm-tasks'],
    createdAt:   '',
    updatedAt:   '',
  },
  {
    id:          -2,
    name:        'seo-employee',
    guardName:   'employee',
    permissions: ['view-seo-projects', 'view-seo-tasks'],
    createdAt:   '',
    updatedAt:   '',
  },
];

const MANAGER_ONLY_ROLES = new Set([
  'super-admin',
  'hr-manager',
  'project-manager',
  'seo-manager',
]);

export function useEmployeeAssignableRoles(assignedRoles: string[] = []) {
  const { data: employeeRoles = [], isLoading: loadingEmployee } = useRoleList('employee');

  const allRoles = useMemo(() => {
    const merged = new Map<string, ApiRole>();
    for (const role of [...employeeRoles, ...EMPLOYEE_ROLE_FALLBACK]) {
      if (!merged.has(role.name)) merged.set(role.name, role);
    }
    return [...merged.values()];
  }, [employeeRoles]);

  const available = useMemo(
    () => assignableRoles(allRoles, assignedRoles).filter((r) => !MANAGER_ONLY_ROLES.has(r.name)),
    [allRoles, assignedRoles],
  );

  return {
    allRoles,
    availableRoles: available,
    isLoading: loadingEmployee,
  };
}
