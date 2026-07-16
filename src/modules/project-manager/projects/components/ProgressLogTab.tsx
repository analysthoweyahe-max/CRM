import type { Task }    from '../../tasks/types/task.types';
import { ProgressDonutCard }    from './ProgressDonutCard';
import { TaskDistributionCard } from './TaskDistributionCard';
import { PhaseProgressCard }    from './PhaseProgressCard';
import { TeamProductivityCard } from './TeamProductivityCard';
import { BurndownCard }         from './BurndownCard';
import { ActivityFeedCard }     from './ActivityFeedCard';
import { pmProjectsApi }        from '../api/project.api';

interface Props {
  projectId: string;
  tasks:     Task[];
  isAr:      boolean;
}

export function ProgressLogTab({ projectId, tasks, isAr }: Props) {
  const tasksTotal     = tasks.length;
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const progress       = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  return (
    <div className="space-y-4">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressDonutCard
          progress={progress}
          tasksCompleted={tasksCompleted}
          tasksTotal={tasksTotal}
          isAr={isAr}
        />
        <TaskDistributionCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhaseProgressCard
          isAr={isAr}
          phases={Array.from(
            tasks.reduce((map, t) => {
              const label = t.phaseName?.trim();
              if (!label) return map;
              const entry = map.get(label) ?? { done: 0, total: 0 };
              entry.total += 1;
              if (t.status === 'completed') entry.done += 1;
              map.set(label, entry);
              return map;
            }, new Map<string, { done: number; total: number }>()),
          ).map(([label, { done, total }]) => ({
            label,
            progress: total ? Math.round((done / total) * 100) : 0,
          }))}
        />
        <TeamProductivityCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 3 — full width */}
      <BurndownCard tasks={tasks} totalTasks={tasksTotal} isAr={isAr} />

      {/* Row 4: activity log from API */}
      <ActivityFeedCard
        queryKey={['pm-activity', projectId]}
        fetchPage={(page, perPage) => pmProjectsApi.getActivity(projectId, page, perPage).then(r => r.data.data)}
        isAr={isAr}
      />

    </div>
  );
}
