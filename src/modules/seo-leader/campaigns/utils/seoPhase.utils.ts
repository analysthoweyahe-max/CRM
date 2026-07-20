import type { SeoProjectPhase } from '../api/campaign.api';
import type { PhaseItem } from '@/shared/modules/project/components/PhasesManagerUI';

export function seoPhasesToPhaseItems(phases: SeoProjectPhase[], isAr: boolean): PhaseItem[] {
  return phases.map(phase => ({
    id:       String(phase.id),
    label:    phase.name,
    duration: phase.tasksCount != null
      ? (isAr ? `${phase.tasksCount} مهام` : `${phase.tasksCount} tasks`)
      : undefined,
  }));
}

export const SEO_PHASE_QUERY_KEY = 'seo-project-phases';

export function seoPhaseQueryKeys(projectId: string) {
  return {
    phases: [SEO_PHASE_QUERY_KEY, projectId] as const,
    clientUpdates: ['seo-client-updates', projectId] as const,
  };
}

export function invalidateSeoProjectPhases(
  queryClient: { invalidateQueries: (opts: { queryKey: readonly unknown[] }) => void },
  projectId: string,
) {
  const keys = seoPhaseQueryKeys(projectId);
  queryClient.invalidateQueries({ queryKey: keys.phases });
  queryClient.invalidateQueries({ queryKey: keys.clientUpdates });
}
