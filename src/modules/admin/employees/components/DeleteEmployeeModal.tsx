import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { AdminEmployee } from '../types/adminEmployee.types';

interface Props {
  employee:  AdminEmployee | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteEmployeeModal({ employee, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!employee}
      onClose={onClose}
      title={isAr ? 'حذف الموظف' : 'Delete Employee'}
      description={
        employee
          ? (isAr
            ? `هل أنت متأكد من حذف "${employee.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${employee.name}"? This action cannot be undone.`)
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
