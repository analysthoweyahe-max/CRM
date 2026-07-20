import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiPmProjectStatus } from '../types/pmProjectStatus.types';

interface Props {
  status:    ApiPmProjectStatus | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeletePmProjectStatusModal({ status, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!status}
      onClose={onClose}
      title={isAr ? 'حذف حالة المشروع' : 'Delete Project Status'}
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
