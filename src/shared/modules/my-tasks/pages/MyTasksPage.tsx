import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { CheckSquare } from 'lucide-react';
import { AddTaskModal } from '@/modules/employee/tasks/components/AddTaskModal';
import { AddSelfSeoTaskModal } from '@/modules/seo-member/tasks/components/AddSelfSeoTaskModal';
import { useMyTasksPage } from '../hooks/useMyTasksPage';
import { MyTasksKanbanBoard } from '../components/MyTasksKanbanBoard';
import { MyTasksProjectFilter } from '../components/MyTasksProjectFilter';
import type { MyTask } from '../types/myTasks.types';

export function MyTasksPage() {
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';
  const [showAdd, setShowAdd] = useState(false);

  const {
    config,
    tasksRole,
    projectId,
    setProjectId,
    projectOptions,
    data,
    isLoading,
    isError,
    errorStatus,
    updateStatus,
    getTaskId,
  } = useMyTasksPage(isAr, { routeProjectId });

  function handleOpen(task: MyTask) {
    if (!config || !tasksRole) return;
    const pid = task.project?.id ?? (projectId || undefined);
    if (!pid) return;
    navigate(config.taskDetailPath(pid, getTaskId(task)));
  }

  if (!tasksRole || !config) {
    return (
      <EmptyState
        icon={<CheckSquare size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
        title={isAr ? 'غير متاح' : 'Not available'}
        description={isAr ? 'لا يمكن عرض المهام لهذا الدور.' : 'Tasks are not available for this role.'}
      />
    );
  }

  if (isError) {
    const isForbidden = errorStatus === 403;
    return (
      <EmptyState
        icon={<CheckSquare size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
        title={isForbidden
          ? (isAr ? 'ليس لديك صلاحية' : 'Access denied')
          : (isAr ? 'تعذر تحميل المهام' : 'Failed to load tasks')}
        description={isForbidden
          ? (isAr ? 'تعذر جلب مهامك المُسندة. تواصل مع المسؤول إذا استمرت المشكلة.' : 'Could not load your assigned tasks. Contact an administrator if this persists.')
          : (isAr ? 'حدث خطأ أثناء جلب المهام. حاول مرة أخرى.' : 'An error occurred while fetching tasks. Please try again.')}
      />
    );
  }

  const total = data?.total ?? 0;
  const subtitle = isAr ? `${total} مهمة` : `${total} tasks`;

  return (
    <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'مهامي' : 'My Tasks'}
        subtitle={subtitle}
        actions={
          config.canAddSelfTask ? (
            <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
              {isAr ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          ) : undefined
        }
      />

      <MyTasksProjectFilter
        isAr={isAr}
        projectId={projectId}
        onProjectChange={setProjectId}
        projects={projectOptions}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      ) : !data || data.total === 0 ? (
        <EmptyState
          icon={<CheckSquare size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
          title={isAr ? 'لا توجد مهام' : 'No tasks'}
          description={isAr ? 'لم يتم إسناد أي مهام لك بعد.' : 'No tasks have been assigned to you yet.'}
        />
      ) : (
        <MyTasksKanbanBoard
          data={data}
          isAr={isAr}
          showProjectName={config.showProjectName && !projectId}
          canDrag={config.canDragStatus}
          onOpen={handleOpen}
          onStatusChange={async (task, toStatus) => {
            const pid = task.project?.id ?? (projectId || undefined);
            if (!pid || !tasksRole) return;
            await updateStatus(pid, getTaskId(task), toStatus);
          }}
        />
      )}

      {config.canAddSelfTask && tasksRole === 'pm-employee' && (
        <AddTaskModal open={showAdd} onClose={() => setShowAdd(false)} isAr={isAr} />
      )}
      {config.canAddSelfTask && tasksRole === 'seo-employee' && (
        <AddSelfSeoTaskModal open={showAdd} onClose={() => setShowAdd(false)} isAr={isAr} />
      )}
    </div>
  );
}
