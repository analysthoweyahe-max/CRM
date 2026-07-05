import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { getRoleNameLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  role:      ApiRole | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteRoleModal({ role, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!role}
      onClose={onClose}
      title={isAr ? 'حذف الدور' : 'Delete Role'}
      description={
        role
          ? (isAr
            ? `هل أنت متأكد من حذف دور "${getRoleNameLabel(role.name, isAr)}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${getRoleNameLabel(role.name, isAr)}"? This action cannot be undone.`)
          : undefined
      }
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
            {isAr ? 'حذف' : 'Delete'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    />
  );
}
