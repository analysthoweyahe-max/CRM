import type { SeoProjectPhase } from '../api/campaign.api';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
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

/** Combobox options for SEO task create/edit — value is the numeric phase id. */
export function seoPhasesToComboboxItems(phases: SeoProjectPhase[]): ComboboxItem[] {
  return phases.map(phase => ({
    id:    String(phase.id),
    label: phase.name,
  }));
}

/** Resolve a Combobox phase id to the create/update payload fields. */
export function resolveSeoPhasePayload(
  phases: SeoProjectPhase[],
  selectedId: string,
): { phase: string; phaseId: number } | null {
  const match = phases.find(p => String(p.id) === selectedId);
  if (!match?.name.trim()) return null;
  return { phase: match.name.trim(), phaseId: match.id };
}

/** Prefill Combobox value from task phaseId or phase/stage name. */
export function matchSeoPhaseComboboxValue(
  phases: SeoProjectPhase[],
  opts: { phaseId?: number | null; phase?: string | null; stage?: string | null },
): string {
  if (opts.phaseId != null) {
    const byId = phases.find(p => p.id === Number(opts.phaseId));
    if (byId) return String(byId.id);
  }
  const name = (opts.phase || opts.stage || '').trim();
  if (name) {
    const byName = phases.find(p => p.name === name);
    if (byName) return String(byName.id);
  }
  return '';
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
