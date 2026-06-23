import { Doughnut } from 'react-chartjs-2';
import { Card }     from '@/shared/components/ui/Card';
import { C_GREEN, C_GRAY_200, TOOLTIP_STYLE } from './progressCharts.config';
import type { Project } from '../types/project.types';

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProgressDonutCard({ project, isAr }: Props) {
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
                data: [project.progress, 100 - project.progress],
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
              {project.progress}%
            </span>
            <span className="text-xs text-gray-400 mt-1">{isAr ? 'الإنجاز' : 'Progress'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {project.tasksCompleted} {isAr ? 'من' : 'of'} {project.tasksTotal} {isAr ? 'مهمة مكتملة' : 'tasks done'}
        </p>
      </div>
    </Card>
  );
}
