import type { Project } from '../types/project.types';
import type { Task }    from '../../tasks/types/task.types';
import { ProgressDonutCard }    from './ProgressDonutCard';
import { TaskDistributionCard } from './TaskDistributionCard';
import { PhaseProgressCard }    from './PhaseProgressCard';
import { TeamProductivityCard } from './TeamProductivityCard';
import { BurndownCard }         from './BurndownCard';

interface Props {
  project: Project;
  tasks:   Task[];
  isAr:    boolean;
}

export function ProgressLogTab({ project, tasks, isAr }: Props) {
  return (
    <div className="space-y-4">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressDonutCard    project={project} isAr={isAr} />
        <TaskDistributionCard tasks={tasks}     isAr={isAr} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhaseProgressCard               isAr={isAr} />
        <TeamProductivityCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 3 — full width */}
      <BurndownCard tasks={tasks} totalTasks={project.tasksTotal} isAr={isAr} />

    </div>
  );
}
