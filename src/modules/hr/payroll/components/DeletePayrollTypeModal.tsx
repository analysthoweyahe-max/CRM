import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiPayrollAdjustmentType } from '../types/payroll.types';

interface Props {
  item:      ApiPayrollAdjustmentType | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeletePayrollTypeModal({ item, onClose, onConfirm, isLoading, isAr }: Props) {
  const name = item
    ? (isAr ? (item.label || item.nameAr || item.name) : (item.name || item.label))
    : '';

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={isAr ? 'حذف النوع' : 'Delete Type'}
      description={
        item
          ? (isAr
            ? `هل أنت متأكد من حذف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${name}"? This action cannot be undone.`)
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
