import { ProjectClientIssuesTab } from '@/shared/modules/project-client-issues/components/ProjectClientIssuesTab';

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectClientUpdatesTab({ projectId, isAr }: Props) {
  return <ProjectClientIssuesTab projectId={projectId} portal="pm-manager" isAr={isAr} />;
}
