import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { PmProjectTemplate } from '../types/template.types';

interface Props {
  template:  PmProjectTemplate | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteTemplateModal({ template, onClose, onConfirm, isLoading, isAr }: Props) {
  return (
    <Modal
      open={!!template}
      onClose={onClose}
      title={isAr ? 'حذف القالب' : 'Delete Template'}
      description={
        template
          ? (isAr
            ? `هل أنت متأكد من حذف "${template.name}"؟ لا يمكن الحذف إذا كان القالب مستخدماً في مشاريع.`
            : `Are you sure you want to delete "${template.name}"? Deletion fails if the template is used by projects.`)
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
