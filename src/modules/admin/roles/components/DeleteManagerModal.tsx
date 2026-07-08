import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { AdminEmployee } from '@/modules/admin/employees/types/adminEmployee.types';

interface Props {
  manager:   AdminEmployee | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteManagerModal({ manager, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!manager}
      onClose={onClose}
      title={isAr ? 'حذف المدير' : 'Delete Manager'}
      description={
        manager
          ? (isAr
            ? `هل أنت متأكد من حذف "${manager.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${manager.name}"? This action cannot be undone.`)
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
