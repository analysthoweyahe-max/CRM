import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ApiJobTitle } from '../types/adminJobTitle.types';

interface Props {
  jobTitle:  ApiJobTitle | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteJobTitleModal({ jobTitle, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!jobTitle}
      onClose={onClose}
      title={isAr ? 'حذف المسمى الوظيفي' : 'Delete Job Title'}
      description={
        jobTitle
          ? (isAr
            ? `هل أنت متأكد من حذف المسمى الوظيفي "${jobTitle.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            : `Are you sure you want to delete "${jobTitle.name}"? This action cannot be undone.`)
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
