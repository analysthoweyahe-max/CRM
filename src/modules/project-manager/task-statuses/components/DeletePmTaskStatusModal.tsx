import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiPmTaskStatus } from '../types/pmTaskStatus.types';

interface Props {
  status:    ApiPmTaskStatus | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeletePmTaskStatusModal({ status, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!status}
      onClose={onClose}
      title={isAr ? 'حذف حالة المهمة' : 'Delete Task Status'}
      description={
        status
          ? (isAr
            ? `هل أنت متأكد من حذف حالة "${status.labelAr}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${status.labelEn}"? This action cannot be undone.`)
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
