import { useState }      from 'react';
import { useNavigate }   from 'react-router-dom';
import { Plus }          from 'lucide-react';
import { useLang }       from '@/app/providers/LanguageProvider';
import { ROUTES }        from '@/app/router/routes';
import { PageHeader }    from '@/shared/components/ui/PageHeader';
import { Button }        from '@/shared/components/ui/Button';
import { Card }          from '@/shared/components/ui/Card';
import { TaskFilters }   from '@/modules/employee/tasks/components/TaskFilters';
import { useSeoTasks }       from '../hooks/useSeoTasks';
import { useSeoTaskFilters } from '../hooks/useSeoTaskFilters';
import { SeoTaskCard }       from '../components/SeoTaskCard';
import { AddSelfSeoTaskModal } from '../components/AddSelfSeoTaskModal';

function SeoTaskSkeleton() {
  return (
    <Card padding="md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="h-5 w-48 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-4 w-36 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 rounded-lg bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SeoMemberTasksPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useSeoTasks();
  const tasks      = data?.tasks      ?? [];
  const phaseNames = data?.phaseNames ?? [];
  const total      = data?.total      ?? 0;

  const {
    status, setStatus,
    priority, setPriority,
    phase, setPhase,
    deadline, setDeadline,
    statusItems, priorityItems, phaseItems, deadlineItems,
    filtered,
  } = useSeoTaskFilters(tasks, phaseNames, isAr);

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'مهامي' : 'My Tasks'}
        subtitle={isAr ? `${total} مهمة` : `${total} tasks`}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
            {isAr ? 'إضافة مهمة' : 'Add Task'}
          </Button>
        }
      />

      <TaskFilters
        statusItems={statusItems}
        priorityItems={priorityItems}
        projectItems={phaseItems}
        deadlineItems={deadlineItems}
        status={status}
        priority={priority}
        project={phase}
        deadline={deadline}
        onStatus={setStatus}
        onPriority={setPriority}
        onProject={setPhase}
        onDeadline={setDeadline}
        isAr={isAr}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SeoTaskSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
          {isAr ? 'لا توجد مهام' : 'No tasks found'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <SeoTaskCard
              key={task.id}
              task={task}
              isAr={isAr}
              onDetails={id => {
                const projectId = task.project?.id;
                if (projectId) navigate(ROUTES.SEO_MEMBER.TASK_DETAIL(projectId, id));
              }}
            />
          ))}
        </div>
      )}

      <AddSelfSeoTaskModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        isAr={isAr}
      />

    </div>
  );
}
