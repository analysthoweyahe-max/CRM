import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card }    from '@/shared/components/ui/Card';
import { ROUTES }  from '@/app/router/routes';
import { TaskCard } from '@/modules/employee/tasks/components/TaskCard';
import type { EmployeeTask } from '@/modules/employee/tasks/types/employeeTask.types';

interface Props {
  tasks: EmployeeTask[];
  isAr:  boolean;
}

const PREVIEW_COUNT = 4;

export function MyTasksSection({ tasks, isAr }: Props) {
  const navigate = useNavigate();
  const preview  = tasks.slice(0, PREVIEW_COUNT);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          {isAr ? 'مهامي' : 'My Tasks'}
        </h2>
        {tasks.length > 0 && (
          <button
            onClick={() => navigate(ROUTES.EMPLOYEE.TASKS)}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
          >
            {isAr ? 'عرض الكل' : 'View All'}
            {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        )}
      </div>

      {preview.length === 0 ? (
        <div className="py-12 text-center">
          <CheckSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لا توجد مهام مسندة إليك حاليًا' : 'You have no assigned tasks yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {preview.map(task => (
            <TaskCard key={task.id} task={task} isAr={isAr} />
          ))}
        </div>
      )}
    </Card>
  );
}
