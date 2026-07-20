import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import type { KanbanColumnData } from '@/shared/components/kanban/KanbanBoard';
import type { Task } from '@/modules/project-manager/tasks/types/task.types';
import type { PhasedTasksResponse, SeoProjectPhase, SeoTask } from '../api/campaign.api';

export const SEO_PHASE_NONE_KEY = '__none__';
export const SEO_PHASE_NAME_PREFIX = 'name:';

export function readSeoTaskPhaseId(task: SeoTask): number | undefined {
  if (task.phaseId != null) return Number(task.phaseId);
  const snake = (task as SeoTask & { phase_id?: number | null }).phase_id;
  if (snake != null) return Number(snake);
  return undefined;
}

/** Flatten phased task groups and inherit group-level phaseId when missing on tasks. */
export function flattenSeoPhasedTasks(data: PhasedTasksResponse): SeoTask[] {
  return (data.phases ?? []).flatMap((group) => {
    const groupPhaseId = group.phaseId
      ?? (group as { phase_id?: number | null }).phase_id
      ?? null;
    const groupPhaseName = group.phase ?? null;
    return (group.tasks ?? []).map((task) => ({
      ...task,
      phase:    task.phase ?? groupPhaseName,
      phaseId:  readSeoTaskPhaseId(task) ?? (groupPhaseId != null ? Number(groupPhaseId) : null),
    }));
  });
}

export function resolveSeoTaskPhaseColumnKey(task: Task, phases: SeoProjectPhase[]): string {
  if (task.phaseId != null) return String(task.phaseId);
  if (task.phaseName) {
    const matched = phases.find(p => p.name === task.phaseName);
    if (matched) return String(matched.id);
    return `${SEO_PHASE_NAME_PREFIX}${task.phaseName}`;
  }
  return SEO_PHASE_NONE_KEY;
}

function resolveSeoTaskPhaseColumnLabel(
  task: Task,
  phases: SeoProjectPhase[],
  noPhaseLabel: string,
): string {
  if (task.phaseId != null) {
    const matched = phases.find(p => p.id === task.phaseId);
    if (matched) return matched.name;
  }
  if (task.phaseName) return task.phaseName;
  return noPhaseLabel;
}

export interface BuildSeoPhaseColumnsOptions<T extends Task> {
  phases:      SeoProjectPhase[];
  tasks:       T[];
  phaseFilter: string;
  isAr:        boolean;
}

/** Seed columns from the project phase catalog, then bucket tasks (PM-style). */
export function buildSeoPhaseKanbanColumns<T extends Task>({
  phases,
  tasks,
  phaseFilter,
  isAr,
}: BuildSeoPhaseColumnsOptions<T>): KanbanColumnData<T>[] {
  const noPhaseLabel = isAr ? 'بدون مرحلة' : 'No phase';
  const map = new Map<string, { key: string; label: string; items: T[] }>();

  for (const phase of phases) {
    const key = String(phase.id);
    if (phaseFilter && key !== phaseFilter) continue;
    map.set(key, { key, label: phase.name, items: [] });
  }

  for (const task of tasks) {
    const key = resolveSeoTaskPhaseColumnKey(task, phases);
    if (phaseFilter && key !== phaseFilter) continue;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: resolveSeoTaskPhaseColumnLabel(task, phases, noPhaseLabel),
        items: [],
      });
    }
    map.get(key)!.items.push(task);
  }

  if (phaseFilter && !map.has(phaseFilter)) {
    const fromList = phases.find(p => String(p.id) === phaseFilter);
    map.set(phaseFilter, {
      key:   phaseFilter,
      label: fromList?.name ?? phaseFilter,
      items: [],
    });
  }

  return Array.from(map.values()).map(col => ({
    ...col,
    color: colorForKey(col.key),
  }));
}

export function buildSeoPhaseFilterItems(
  phases: SeoProjectPhase[],
  tasks: Task[],
  isAr: boolean,
): { id: string; label: string }[] {
  const map = new Map<string, { id: string; label: string }>();
  for (const phase of phases) {
    map.set(String(phase.id), { id: String(phase.id), label: phase.name });
  }
  for (const task of tasks) {
    const key = resolveSeoTaskPhaseColumnKey(task, phases);
    if (!key || key === SEO_PHASE_NONE_KEY || map.has(key)) continue;
    map.set(key, {
      id:    key,
      label: task.phaseName || key,
    });
  }
  return [
    { id: '', label: isAr ? 'كل المراحل' : 'All phases' },
    ...Array.from(map.values()),
  ];
}

export function seoPhaseDropPayload(toPhaseKey: string): { phaseId?: number; phase?: string } {
  if (toPhaseKey === SEO_PHASE_NONE_KEY) return {};
  if (toPhaseKey.startsWith(SEO_PHASE_NAME_PREFIX)) {
    return { phase: toPhaseKey.slice(SEO_PHASE_NAME_PREFIX.length) };
  }
  const id = Number(toPhaseKey);
  if (Number.isFinite(id) && id > 0) return { phaseId: id };
  return { phase: toPhaseKey };
}
