import { Line } from 'react-chartjs-2';
import { Card } from '@/shared/components/ui/Card';
import { C_GREEN, C_GRAY_400, TOOLTIP_STYLE } from './progressCharts.config';
import type { Task } from '../../tasks/types/task.types';

const DAYS_AR = ['الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الإثنين', 'الأحد', 'السبت'];

interface Props {
  tasks:      Task[];
  totalTasks: number;
  isAr:       boolean;
}

export function BurndownCard({ tasks, totalTasks, isAr }: Props) {
  const total     = tasks.length || totalTasks;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const remaining = total - completed;
  const step      = total / (DAYS_AR.length - 1);

  const ideal  = DAYS_AR.map((_, i) => +Math.max(0, total - step * i).toFixed(1));
  const actual = [
    total,
    total,
    total - 0.5,
    total - 1,
    total - 1,
    total - completed * 0.6,
    remaining,
  ].map(v => +Math.max(0, v).toFixed(1));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between flex-wrap gap-y-2 mb-4">
        {/* Legend (end = left in RTL) */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0 border-t-2 border-dashed" style={{ borderColor: C_GRAY_400 }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'المثالي' : 'Ideal'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: C_GREEN }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'المتبقي الفعلي' : 'Actual Remaining'}
            </span>
          </div>
        </div>

        {/* Title (start = right in RTL) */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {isAr ? 'مخطط الإنجاز (Burndown)' : 'Burndown Chart'}
        </h3>
      </div>

      <div className="h-60">
        <Line
          data={{
            labels: DAYS_AR,
            datasets: [
              {
                label: isAr ? 'المتبقي الفعلي' : 'Actual',
                data: actual,
                borderColor: C_GREEN,
                backgroundColor: 'rgba(160,205,57,0.08)',
                borderWidth: 2.5,
                pointBackgroundColor: C_GREEN,
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35,
                fill: true,
              },
              {
                label: isAr ? 'المثالي' : 'Ideal',
                data: ideal,
                borderColor: C_GRAY_400,
                borderWidth: 1.5,
                borderDash: [6, 4],
                pointRadius: 0,
                tension: 0,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeInOutQuart' },
            interaction: { mode: 'index', intersect: false },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: C_GRAY_400, font: { size: 11 } },
              },
              y: {
                grid: { color: 'rgba(156,163,175,0.12)' },
                border: { display: false },
                ticks: { color: C_GRAY_400, font: { size: 11 }, stepSize: 3 },
                beginAtZero: true,
                max: total,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: TOOLTIP_STYLE,
            },
          }}
        />
      </div>
    </Card>
  );
}
