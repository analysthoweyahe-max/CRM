import { Doughnut } from 'react-chartjs-2';
import { Card }     from '@/shared/components/ui/Card';
import { C_GREEN, C_DARK_GREEN, C_AMBER, C_GRAY_200 } from './progressCharts.config';
import type { Task } from '../../tasks/types/task.types';

const LEGEND = [
  { key: 'completed'    as const, label: 'مكتمل',          color: C_GREEN      },
  { key: 'in_progress'  as const, label: 'قيد التنفيذ',    color: C_DARK_GREEN },
  { key: 'needs_review' as const, label: 'بحاجة لمراجعة',  color: C_AMBER      },
  { key: 'pending'      as const, label: 'قيد الانتظار',   color: C_GRAY_200   },
];

interface Props {
  tasks: Task[];
  isAr:  boolean;
}

export function TaskDistributionCard({ tasks, isAr }: Props) {
  const counts = {
    completed:    tasks.filter(t => t.status === 'completed').length,
    in_progress:  tasks.filter(t => t.status === 'in_progress').length,
    needs_review: tasks.filter(t => t.status === 'needs_review').length,
    pending:      tasks.filter(t => t.status === 'pending').length,
  };

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 text-end">
        {isAr ? 'توزيع المهام حسب الحالة' : 'Task Distribution'}
      </h3>

      <div className="flex items-center justify-center gap-8">
        <div className="relative w-36 h-36 shrink-0">
          <Doughnut
            data={{
              datasets: [{
                data: [counts.completed, counts.in_progress, counts.needs_review, counts.pending],
                backgroundColor: [C_GREEN, C_DARK_GREEN, C_AMBER, C_GRAY_200],
                borderWidth: 3,
                borderColor: 'white',
                borderRadius: 3,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '68%',
              animation: { animateRotate: true, duration: 1000 },
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        <div className="space-y-2.5">
          {LEGEND.map(item => (
            <div key={item.key} className="flex items-center gap-2 min-w-[130px]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{counts[item.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
