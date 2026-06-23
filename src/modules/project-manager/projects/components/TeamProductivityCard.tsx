import { Bar }  from 'react-chartjs-2';
import { Card } from '@/shared/components/ui/Card';
import { C_INDIGO, C_GRAY_400, TOOLTIP_STYLE } from './progressCharts.config';
import type { Task } from '../../tasks/types/task.types';

interface Props {
  tasks: Task[];
  isAr:  boolean;
}

export function TeamProductivityCard({ tasks, isAr }: Props) {
  const teamMap = new Map<string, number>();
  tasks.forEach(t => {
    if (t.estimatedHours) {
      teamMap.set(t.assigneeName, (teamMap.get(t.assigneeName) ?? 0) + t.estimatedHours);
    }
  });
  const labels = Array.from(teamMap.keys());
  const hours  = Array.from(teamMap.values());

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 text-end">
        {isAr ? 'إنتاجية الفريق (ساعات)' : 'Team Productivity (hrs)'}
      </h3>

      <div className="h-48">
        <Bar
          data={{
            labels,
            datasets: [{
              data: hours,
              backgroundColor: C_INDIGO,
              borderRadius: 6,
              barThickness: 28,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: C_GRAY_400, font: { size: 11 } },
              },
              y: {
                grid: { color: 'rgba(156,163,175,0.12)' },
                border: { display: false },
                ticks: { color: C_GRAY_400, font: { size: 11 } },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...TOOLTIP_STYLE,
                callbacks: {
                  label: ctx => ` ${ctx.parsed.y} ${isAr ? 'ساعة' : 'hrs'}`,
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
}
