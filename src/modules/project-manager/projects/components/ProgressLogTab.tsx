import type { Task }    from '../../tasks/types/task.types';
import { ProgressDonutCard }    from './ProgressDonutCard';
import { TaskDistributionCard } from './TaskDistributionCard';
import { PhaseProgressCard }    from './PhaseProgressCard';
import { TeamProductivityCard } from './TeamProductivityCard';
import { BurndownCard }         from './BurndownCard';

interface Props {
  tasks: Task[];
  isAr:  boolean;
}

export function ProgressLogTab({ tasks, isAr }: Props) {
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
        <PhaseProgressCard               isAr={isAr} />
        <TeamProductivityCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 3 — full width */}
      <BurndownCard tasks={tasks} totalTasks={tasksTotal} isAr={isAr} />

    </div>
  );
}
