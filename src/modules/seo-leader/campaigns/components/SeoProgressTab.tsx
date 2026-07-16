import { Doughnut } from 'react-chartjs-2';
import { Card } from '@/shared/components/ui/Card';
import {
  C_GREEN, C_GRAY_200, TOOLTIP_STYLE,
} from '@/modules/project-manager/projects/components/progressCharts.config';
import { TaskDistributionCard } from '@/modules/project-manager/projects/components/TaskDistributionCard';
import { PhaseProgressCard } from '@/modules/project-manager/projects/components/PhaseProgressCard';
import { TeamProductivityCard } from '@/modules/project-manager/projects/components/TeamProductivityCard';
import { ActivityFeedCard } from '@/modules/project-manager/projects/components/ActivityFeedCard';
import { campaignApi } from '../api/campaign.api';
import type { Task } from '@/modules/project-manager/tasks/types/task.types';

function SeoProgressDonutCard({ tasks, isAr }: { tasks: Task[]; isAr: boolean }) {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress  = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 text-end">
        {isAr ? 'نسبة الإنجاز الإجمالية' : 'Overall Progress'}
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-44 h-44">
          <Doughnut
            data={{
              datasets: [{
                data: [progress, 100 - progress],
                backgroundColor: [C_GREEN, C_GRAY_200],
                borderWidth: 0,
                borderRadius: 6,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '82%',
              animation: { animateRotate: true, duration: 1000 },
              plugins: {
                legend:  { display: false },
                tooltip: { enabled: false, ...TOOLTIP_STYLE },
              },
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-none">
              {progress}%
            </span>
            <span className="text-xs text-gray-400 mt-1">{isAr ? 'الإنجاز' : 'Progress'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {completed} {isAr ? 'من' : 'of'} {total} {isAr ? 'مهمة مكتملة' : 'tasks done'}
        </p>
      </div>
    </Card>
  );
}

function phasesFromTasks(tasks: Task[]): { label: string; progress: number }[] {
  const map = new Map<string, { done: number; total: number }>();
  for (const t of tasks) {
    const label = t.phaseName?.trim();
    if (!label) continue;
    const entry = map.get(label) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (t.status === 'completed') entry.done += 1;
    map.set(label, entry);
  }
  return Array.from(map.entries()).map(([label, { done, total }]) => ({
    label,
    progress: total ? Math.round((done / total) * 100) : 0,
  }));
}

function hasProductivityData(tasks: Task[]): boolean {
  return tasks.some(t => Boolean(t.estimatedHours || t.estimatedMinutes) && Boolean(t.assigneeName));
}

interface Props {
  projectId: string;
  tasks:     Task[];
  isAr:      boolean;
}

export function SeoProgressTab({ projectId, tasks, isAr }: Props) {
  const hasTasks        = tasks.length > 0;
  const phases          = phasesFromTasks(tasks);
  const showProductivity = hasProductivityData(tasks);

  return (
    <div className="space-y-4 pb-10">
      {!hasTasks && (
        <Card className="p-10 text-center text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد بيانات إنجاز لعرضها بعد' : 'No progress data to show yet'}
        </Card>
      )}

      {hasTasks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SeoProgressDonutCard tasks={tasks} isAr={isAr} />
          <TaskDistributionCard tasks={tasks} isAr={isAr} />
        </div>
      )}

      {(phases.length > 0 || showProductivity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.length > 0 && (
            <PhaseProgressCard isAr={isAr} phases={phases} />
          )}
          {showProductivity && (
            <TeamProductivityCard tasks={tasks} isAr={isAr} />
          )}
        </div>
      )}

      <ActivityFeedCard
        queryKey={['seo-activity', projectId]}
        fetchPage={(page, perPage) => campaignApi.getActivity(projectId, page, perPage).then(r => r.data.data)}
        isAr={isAr}
        hideWhenEmpty
      />
    </div>
  );
}
