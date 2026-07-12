import { ShieldPlus, RotateCcw } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Badge }  from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { PermissionTagList } from '@/shared/components/ui/PermissionTagList';
import { getRoleLabel } from '../types/adminEmployee.types';
import { AssignRoleModal } from '@/modules/admin/roles/components/AssignRoleModal';
import type { AssignRolePayload } from '@/modules/admin/roles/components/AssignRoleModal';
import type { ApiRole } from '@/modules/admin/roles/types/adminRole.types';

interface Props {
  roles:                 string[];
  permissions:           string[];
  roleManuallyAssigned:  boolean;
  sectionLabel?:         string;
  isAr:                  boolean;
  canAssign:             boolean;
  availableRoles:        ApiRole[];
  modalOpen:             boolean;
  isAssigning:           boolean;
  onOpenAssign:          () => void;
  onCloseAssign:         () => void;
  onAssign:              (payload: AssignRolePayload) => void;
  onResetToDepartment:   () => void;
}

export function EmployeeRolesCard({
  roles,
  permissions,
  roleManuallyAssigned,
  sectionLabel,
  isAr,
  canAssign,
  availableRoles,
  modalOpen,
  isAssigning,
  onOpenAssign,
  onCloseAssign,
  onAssign,
  onResetToDepartment,
}: Props) {
  const currentRole = roles[0];

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {canAssign && roleManuallyAssigned && (
              <Button
                variant="secondary"
                size="sm"
                startIcon={<RotateCcw size={14} />}
                onClick={onResetToDepartment}
              >
                {isAr ? 'استخدام الافتراضي حسب القسم' : 'Use department default'}
              </Button>
            )}
            {canAssign && (
              <Button
                variant="secondary"
                size="sm"
                startIcon={<ShieldPlus size={14} />}
                onClick={onOpenAssign}
              >
                {isAr ? 'تغيير الدور' : 'Change Role'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {roles.length > 0 && (
              <span
                title={roleManuallyAssigned
                  ? undefined
                  : (isAr
                      ? `يُعيَّن الدور تلقائياً بناءً على القسم${sectionLabel ? ` (${sectionLabel})` : ''}`
                      : `Role is assigned automatically based on department${sectionLabel ? ` (${sectionLabel})` : ''}`)}
              >
                <Badge
                  label={roleManuallyAssigned ? (isAr ? 'يدوي' : 'Manual') : (isAr ? 'تلقائي (حسب القسم)' : 'Auto (department)')}
                  variant={roleManuallyAssigned ? 'brand' : 'gray'}
                  className={roleManuallyAssigned ? undefined : 'cursor-help'}
                />
              </span>
            )}
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'أدوار الموظف' : 'Employee Roles'}
            </h2>
          </div>
        </div>

        {roles.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {isAr ? 'لم يُعيَّن أي دور بعد' : 'No roles assigned yet'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-end">
            {roles.map((role) => (
              <Badge key={role} label={getRoleLabel(role, isAr)} variant="gray" />
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 text-end">
            {isAr ? 'الصلاحيات الفعّالة' : 'Effective Permissions'}
          </p>
          <PermissionTagList permissions={permissions} isAr={isAr} />
        </div>
      </Card>

      <AssignRoleModal
        open={modalOpen}
        onClose={onCloseAssign}
        onSubmit={onAssign}
        isLoading={isAssigning}
        isAr={isAr}
        title={isAr ? 'تعيين دور للموظف' : 'Assign Role to Employee'}
        availableRoles={availableRoles}
        assignedRoles={roles}
        initialRole={currentRole}
        initialPermissions={permissions}
      />
    </>
  );
}
