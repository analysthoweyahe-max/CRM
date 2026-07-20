import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface Props {
  open:      boolean;
  isAr:      boolean;
  isLoading: boolean;
  onClose:   () => void;
  onConfirm: () => void;
}

export function DeleteClientIssueModal({ open, isAr, isLoading, onClose, onConfirm }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={isAr ? 'حذف المشكلة' : 'Delete Issue'}
      description={isAr
        ? 'هل أنت متأكد من حذف هذه المشكلة؟ لا يمكن التراجع عن هذا الإجراء.'
        : 'Are you sure you want to delete this issue? This action cannot be undone.'}
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
