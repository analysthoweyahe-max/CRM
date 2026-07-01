import { useNavigate }    from 'react-router-dom';
import { ROUTES }          from '@/app/router/routes';
import { DangerZoneCard as SharedDangerZoneCard } from '@/shared/modules/project/components/DangerZoneCard';
import { deleteProject }   from '../store/projectStore';

interface Props {
  projectId:   string;
  projectName: string;
  isAr:        boolean;
}

export function DangerZoneCard({ projectId, projectName, isAr }: Props) {
  const navigate = useNavigate();

  function handleDelete() {
    deleteProject(projectId);
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
  }

  return (
    <SharedDangerZoneCard
      projectName={projectName}
      onDelete={handleDelete}
      isAr={isAr}
    />
  );
}
