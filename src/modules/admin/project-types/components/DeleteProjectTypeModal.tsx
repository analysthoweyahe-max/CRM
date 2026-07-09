import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { PmProjectTypeItem } from '@/modules/project-manager/projects/types/project.types';

interface Props {
  type:      PmProjectTypeItem | null;
  onClose:   () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isAr:      boolean;
}

export function DeleteProjectTypeModal({ type, onClose, onConfirm, isLoading, isAr }: Props) {
  const linkedProjects = type?.projectsCount ?? 0;

  return (
    <Modal
      open={!!type}
      onClose={onClose}
      title={isAr ? 'حذف نوع المشروع' : 'Delete Project Type'}
      description={
        type
          ? linkedProjects > 0
            ? (isAr
              ? `لا يمكن حذف "${type.nameAr || type.name}" لأنه مرتبط بـ ${linkedProjects} مشروع. عطّل النوع بدلاً من ذلك.`
              : `Cannot delete "${type.name}" because it is linked to ${linkedProjects} project(s). Deactivate it instead.`)
            : (isAr
              ? `هل أنت متأكد من حذف "${type.nameAr || type.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
              : `Are you sure you want to delete "${type.name}"? This action cannot be undone.`)
          : undefined
      }
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          {linkedProjects === 0 && (
            <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
              {isAr ? 'حذف' : 'Delete'}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {linkedProjects > 0 ? (isAr ? 'حسناً' : 'OK') : (isAr ? 'إلغاء' : 'Cancel')}
          </Button>
        </div>
      }
    />
  );
}
