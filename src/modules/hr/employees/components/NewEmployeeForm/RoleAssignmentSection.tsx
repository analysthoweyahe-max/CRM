import { ShieldCheck } from 'lucide-react';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { PermissionGroupList } from '@/modules/admin/roles/components/PermissionGroupList';
import { useEmployeeAssignableRoles } from '@/modules/admin/employees/hooks/useEmployeeAssignableRoles';
import { getRoleNameLabel } from '@/modules/admin/roles/types/adminRole.types';
import { permissionsForRole, resolveAssignableRoleName } from '@/modules/admin/roles/utils/role.utils';
import { EMPLOYEE_PERMISSION_GROUPS } from '@/shared/permissions/employeePermissionCatalog';
import type { RoleAssignmentValue } from './newEmployeeForm.types';

interface Props {
  isAr:     boolean;
  value:    RoleAssignmentValue | null;
  onChange: (value: RoleAssignmentValue | null) => void;
}

/**
 * Optional super-admin-only override shown at employee creation. Unchecked (default)
 * means the role is left to the backend's automatic department-based assignment —
 * this section itself is never sent in the create-employee request; checking the box
 * just reveals the same role + permission picker used on the admin employee detail page,
 * and its value is sent as a separate POST /employees/{id}/access call after creation.
 */
export function RoleAssignmentSection({ isAr, value, onChange }: Props) {
  const { availableRoles } = useEmployeeAssignableRoles();
  const custom = value !== null;

  const roleItems = availableRoles.map((r) => ({
    id:    r.name,
    label: getRoleNameLabel(r.name, isAr),
  }));

  function handleCustomToggle(checked: boolean) {
    if (!checked) {
      onChange(null);
      return;
    }
    const first = availableRoles[0]?.name ?? '';
    onChange({ role: first, permissions: first ? permissionsForRole(availableRoles, first) : [] });
  }

  function handleRoleChange(next: string) {
    const slug = resolveAssignableRoleName(next, availableRoles) ?? next;
    onChange({ role: slug, permissions: permissionsForRole(availableRoles, slug) });
  }

  function togglePermission(slug: string) {
    if (!value) return;
    const permissions = value.permissions.includes(slug)
      ? value.permissions.filter((s) => s !== slug)
      : [...value.permissions, slug];
    onChange({ ...value, permissions });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <ShieldCheck size={15} className="text-[#709028]" />
        {isAr ? 'الدور والصلاحيات' : 'Role & Permissions'}
      </h3>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={custom}
            onChange={(e) => handleCustomToggle(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAr ? 'أدوار مخصصة' : 'Custom Roles'}
          </span>
        </label>

        {!custom ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            {isAr
              ? 'سيُعيَّن الدور تلقائياً بناءً على القسم المختار أعلاه (قسم SEO ← seo-employee، أي قسم آخر ← pm-employee).'
              : 'The role will be assigned automatically based on the department selected above (SEO department → seo-employee, otherwise → pm-employee).'}
          </p>
        ) : (
          <>
            <FormField label={isAr ? 'الدور' : 'Role'}>
              <Combobox
                items={roleItems}
                value={value?.role ?? ''}
                onChange={handleRoleChange}
                placeholder={isAr ? 'اختر الدور' : 'Select role'}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {isAr
                  ? 'الصلاحيات (تُعبّأ تلقائياً من الدور ويمكن تعديلها)'
                  : 'Permissions (auto-filled from role, editable)'}
              </p>
              <PermissionGroupList
                selected={value?.permissions ?? []}
                onToggle={togglePermission}
                isAr={isAr}
                guardName="employee"
                groups={EMPLOYEE_PERMISSION_GROUPS}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
