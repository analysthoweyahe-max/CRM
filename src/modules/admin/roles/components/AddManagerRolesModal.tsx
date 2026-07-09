import { AssignRoleModal } from './AssignRoleModal';
import type { AssignAdminRolePayload } from '../types/adminManager.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  open:           boolean;
  onClose:        () => void;
  onSubmit:       (payload: AssignAdminRolePayload) => void;
  isLoading:      boolean;
  isAr:           boolean;
  availableRoles: ApiRole[];
  assignedRoles?: string[];
}

export function AddManagerRolesModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  isAr,
  availableRoles,
  assignedRoles = [],
}: Props) {
  return (
    <AssignRoleModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      isAr={isAr}
      title={isAr ? 'إضافة دور' : 'Add Role'}
      availableRoles={availableRoles}
      assignedRoles={assignedRoles}
    />
  );
}
