import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiPermission } from '../types/adminPermission.types';

interface Props {
  permission: ApiPermission | null;
  onClose:    () => void;
  onConfirm:  () => void;
  isLoading:  boolean;
  isAr:       boolean;
}

export function DeletePermissionModal({ permission, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!permission}
      onClose={onClose}
      title={isAr ? 'حذف الصلاحية' : 'Delete Permission'}
      description={
        permission
          ? (isAr
            ? `هل أنت متأكد من حذف صلاحية "${permission.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${permission.name}"? This action cannot be undone.`)
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
