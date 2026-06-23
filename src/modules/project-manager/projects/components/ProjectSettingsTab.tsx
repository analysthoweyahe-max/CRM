import type { Project }        from '../types/project.types';
import { ProjectInfoForm }     from './ProjectInfoForm';
import { PhasesManager }       from './PhasesManager';
import { ProjectActionsCard }  from './ProjectActionsCard';
import { DangerZoneCard }      from './DangerZoneCard';

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProjectSettingsTab({ project, isAr }: Props) {
  return (
    <div className="space-y-6 pb-10">
      <ProjectInfoForm    project={project} isAr={isAr} />
      <PhasesManager      projectId={project.id} isAr={isAr} />
      <ProjectActionsCard project={project} isAr={isAr} />
      <DangerZoneCard     projectId={project.id} projectName={project.nameAr} isAr={isAr} />
    </div>
  );
}
