import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLang }       from '@/app/providers/LanguageProvider';
import { PageHeader }    from '@/shared/components/ui/PageHeader';
import { Button }        from '@/shared/components/ui/Button';
import { TaskFilters }   from '../components/TaskFilters';
import { TaskList }      from '../components/TaskList';
import { AddTaskModal }  from '../components/AddTaskModal';
import { useTaskFilters } from '../components/useTaskFilters';
import { useEmployeeTasks } from '../hooks/useEmployeeTasks';

export function EmployeeTasksPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [showAddTask, setShowAddTask] = useState(false);

  const { data: allTasks = [], isLoading } = useEmployeeTasks();

  const {
    status, setStatus, priority, setPriority, project, setProject, deadline, setDeadline,
    statusItems, priorityItems, projectItems, deadlineItems, filtered,
  } = useTaskFilters(allTasks, isAr);

  const subtitle = useMemo(
    () => `${filtered.length} ${isAr ? 'مهمة' : 'tasks'}`,
    [filtered.length, isAr],
  );

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'مهامي' : 'My Tasks'}
        subtitle={subtitle}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowAddTask(true)}>
            {isAr ? 'إضافة مهمة' : 'Add Task'}
          </Button>
        }
      />

      <TaskFilters
        statusItems={statusItems} priorityItems={priorityItems}
        projectItems={projectItems} deadlineItems={deadlineItems}
        status={status} priority={priority} project={project} deadline={deadline}
        onStatus={setStatus} onPriority={setPriority}
        onProject={setProject} onDeadline={setDeadline}
        isAr={isAr}
      />

      <TaskList tasks={filtered} isLoading={isLoading} isAr={isAr} />

      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} isAr={isAr} />
    </div>
  );
}
