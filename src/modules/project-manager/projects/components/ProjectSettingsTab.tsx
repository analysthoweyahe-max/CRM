import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import type { PmProjectDetails } from '../types/project.types';
import { ProjectInfoForm }     from './ProjectInfoForm';
import { PhasesManager }       from './PhasesManager';
import { ProjectActionsCard }  from './ProjectActionsCard';
import { DangerZoneCard }      from './DangerZoneCard';
import { ApplyTemplateModal }  from '@/modules/project-manager/templates/components/ApplyTemplateModal';

interface Props {
  project:      PmProjectDetails;
  isAr:         boolean;
  onPublished?: () => void;
}

export function ProjectSettingsTab({ project, isAr, onPublished }: Props) {
  const [showApply, setShowApply] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <ProjectInfoForm projectId={String(project.id)} isAr={isAr} />

      <div className="flex justify-end">
        <Button
          variant="secondary"
          startIcon={<LayoutTemplate size={15} />}
          onClick={() => setShowApply(true)}
        >
          {isAr ? 'تطبيق قالب' : 'Apply Template'}
        </Button>
      </div>

      <PhasesManager      phases={project.phases} isAr={isAr} />
      <ProjectActionsCard project={project} isAr={isAr} onPublished={onPublished} />
      <DangerZoneCard     projectId={String(project.id)} projectName={project.name} isAr={isAr} />

      <ApplyTemplateModal
        open={showApply}
        onClose={() => setShowApply(false)}
        projectId={String(project.id)}
        projectTypeId={project.projectTypeId ?? null}
        isAr={isAr}
      />
    </div>
  );
}
