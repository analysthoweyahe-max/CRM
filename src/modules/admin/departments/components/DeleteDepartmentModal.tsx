import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiDepartment } from '../types/adminDepartment.types';

interface Props {
  department: ApiDepartment | null;
  onClose:    () => void;
  onConfirm:  () => void;
  isLoading:  boolean;
  isAr:       boolean;
}

export function DeleteDepartmentModal({ department, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!department}
      onClose={onClose}
      title={isAr ? 'حذف القسم' : 'Delete Department'}
      description={
        department
          ? (isAr
            ? `هل أنت متأكد من حذف قسم "${department.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${department.name}"? This action cannot be undone.`)
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
