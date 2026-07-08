import { useEffect, useState } from 'react';
import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input }  from '@/shared/components/ui/Input';

const DELETE_CONFIRM_WORD = { ar: 'حذف', en: 'delete' } as const;

interface Props {
  open:      boolean;
  count:     number;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function BulkDeleteEmployeesModal({ open, count, onClose, onConfirm, isLoading, isAr }: Props) {
  const [confirmText, setConfirmText] = useState('');
  const confirmWord = isAr ? DELETE_CONFIRM_WORD.ar : DELETE_CONFIRM_WORD.en;
  const canDelete   = confirmText.trim() === confirmWord
    || (!isAr && confirmText.trim().toLowerCase() === confirmWord);

  useEffect(() => {
    if (!open) setConfirmText('');
  }, [open]);

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
          <Button variant="danger" isLoading={isLoading} disabled={!canDelete} onClick={onConfirm}>
            {isAr ? 'حذف' : 'Delete'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        <label htmlFor="bulk-delete-confirm" className="block text-sm text-gray-600 dark:text-gray-300">
          {isAr
            ? <>اكتب <span className="font-semibold text-gray-900 dark:text-gray-100">حذف</span> للتأكيد</>
            : <>Type <span className="font-semibold text-gray-900 dark:text-gray-100">delete</span> to confirm</>
          }
        </label>
        <Input
          id="bulk-delete-confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={confirmWord}
          autoComplete="off"
        />
      </div>
    </Modal>
  );
}
