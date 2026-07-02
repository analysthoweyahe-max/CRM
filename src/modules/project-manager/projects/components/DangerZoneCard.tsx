import { useNavigate }    from 'react-router-dom';
import { toast }          from 'sonner';
import { ROUTES }          from '@/app/router/routes';
import { DangerZoneCard as SharedDangerZoneCard } from '@/shared/modules/project/components/DangerZoneCard';
import { pmProjectsApi }   from '../api/project.api';

interface Props {
  projectId:   string;
  projectName: string;
  isAr:        boolean;
}

export function DangerZoneCard({ projectId, projectName, isAr }: Props) {
  const navigate = useNavigate();

  function handleDelete() {
    pmProjectsApi.remove(projectId)
      .then(() => {
        toast.success(isAr ? `تم حذف "${projectName}" بنجاح` : `"${projectName}" was deleted`);
        navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          toast.error(isAr
            ? 'ليس لديك صلاحية لحذف هذا المشروع. هذا الإجراء متاح فقط لمدير النظام (Super Admin).'
            : "You don't have permission to delete this project. Only a Super Admin can do this.");
        } else {
          toast.error(isAr ? 'حدث خطأ أثناء حذف المشروع' : 'Failed to delete the project');
        }
      });
  }

  return (
    <SharedDangerZoneCard
      projectName={projectName}
      onDelete={handleDelete}
      isAr={isAr}
    />
  );
}
