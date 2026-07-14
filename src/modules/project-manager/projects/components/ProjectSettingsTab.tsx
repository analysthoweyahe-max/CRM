import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { usePermission }       from '@/shared/hooks/usePermission';
import { resourceKey }         from '@/shared/utils/resourceKey.utils';
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
  const projectId = resourceKey(project);
  const canEdit   = usePermission('edit-pm-project');
  const canDelete = usePermission('delete-pm-project');

  return (
    <div className="space-y-6 pb-10">
      <ProjectInfoForm projectId={projectId} isAr={isAr} readOnly={!canEdit} />

      {canEdit && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            startIcon={<LayoutTemplate size={15} />}
            onClick={() => setShowApply(true)}
          >
            {isAr ? 'تطبيق قالب' : 'Apply Template'}
          </Button>
        </div>
      )}

      <PhasesManager phases={project.phases} isAr={isAr} />
      {canEdit && <ProjectActionsCard project={project} isAr={isAr} onPublished={onPublished} />}
      {canDelete && <DangerZoneCard projectId={projectId} projectName={project.name} isAr={isAr} />}

      {canEdit && (
        <ApplyTemplateModal
          open={showApply}
          onClose={() => setShowApply(false)}
          projectId={projectId}
          projectTypeId={project.projectTypeId ?? null}
          isAr={isAr}
        />
      )}
    </div>
  );
}
