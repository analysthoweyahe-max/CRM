import type { PmProjectDetails } from '../types/project.types';
import { ProjectInfoForm }     from './ProjectInfoForm';
import { PhasesManager }       from './PhasesManager';
import { ProjectActionsCard }  from './ProjectActionsCard';
import { DangerZoneCard }      from './DangerZoneCard';

interface Props {
  project: PmProjectDetails;
  isAr:    boolean;
}

export function ProjectSettingsTab({ project, isAr }: Props) {
  return (
    <div className="space-y-6 pb-10">
      <ProjectInfoForm    projectId={String(project.id)} isAr={isAr} />
      <PhasesManager      phases={project.phases} isAr={isAr} />
      <ProjectActionsCard project={project} isAr={isAr} />
      <DangerZoneCard     projectId={String(project.id)} projectName={project.name} isAr={isAr} />
    </div>
  );
}
