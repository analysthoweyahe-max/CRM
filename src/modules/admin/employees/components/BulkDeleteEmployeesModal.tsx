import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface Props {
  open:      boolean;
  count:     number;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function BulkDeleteEmployeesModal({ open, count, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'حذف الموظفين المحددين' : 'Delete Selected Employees'}
      description={
        isAr
          ? `هل أنت متأكد من حذف ${count} ${count === 1 ? 'موظف' : 'موظفين'}؟ هذا الإجراء لا يمكن التراجع عنه.`
          : `Are you sure you want to delete ${count} selected ${count === 1 ? 'employee' : 'employees'}? This action cannot be undone.`
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
