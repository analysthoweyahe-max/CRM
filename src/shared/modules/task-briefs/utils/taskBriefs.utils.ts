import type { TaskBrief, TaskBriefProject } from '../types/taskBrief.types';

/** Builds the project-filter option list from whatever task briefs are
 *  currently loaded (not a separate projects lookup) — mirrors the
 *  `extractProjectsFromColumns` convention in `myTasks.utils.ts`. */
export function extractProjectsFromTaskBriefs(tasks: TaskBrief[]): TaskBriefProject[] {
  const seen = new Map<string, TaskBriefProject>();

  tasks
    .flatMap(task => (task.project ? [task.project] : []))
    .forEach(project => {
      const key = String(project.id);
      if (!seen.has(key)) seen.set(key, project);
    });

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
