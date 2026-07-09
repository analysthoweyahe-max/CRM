import { ShieldPlus } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Badge }  from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { getRoleLabel } from '../types/adminEmployee.types';
import { AssignRoleModal } from '@/modules/admin/roles/components/AssignRoleModal';
import type { AssignRolePayload } from '@/modules/admin/roles/components/AssignRoleModal';
import type { ApiRole } from '@/modules/admin/roles/types/adminRole.types';

interface Props {
  roles:          string[];
  isAr:           boolean;
  canAssign:      boolean;
  availableRoles: ApiRole[];
  modalOpen:      boolean;
  isAssigning:    boolean;
  onOpenAssign:   () => void;
  onCloseAssign:  () => void;
  onAssign:       (payload: AssignRolePayload) => void;
}

export function EmployeeRolesCard({
  roles,
  isAr,
  canAssign,
  availableRoles,
  modalOpen,
  isAssigning,
  onOpenAssign,
  onCloseAssign,
  onAssign,
}: Props) {
  const hasAvailableRoles = availableRoles.length > 0;

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          {canAssign && hasAvailableRoles && (
            <Button
              variant="secondary"
              size="sm"
              startIcon={<ShieldPlus size={14} />}
              onClick={onOpenAssign}
            >
              {isAr ? 'إضافة دور' : 'Add Role'}
            </Button>
          )}
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'أدوار الموظف' : 'Employee Roles'}
          </h2>
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

        {canAssign && !hasAvailableRoles && roles.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-end">
            {isAr ? 'تم تعيين جميع الأدوار المتاحة.' : 'All available roles are assigned.'}
          </p>
        )}
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
      />
    </>
  );
}
