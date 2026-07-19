import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { AddTaskModal } from '@/modules/employee/tasks/components/AddTaskModal';
import { AddSelfSeoTaskModal } from '@/modules/seo-member/tasks/components/AddSelfSeoTaskModal';
import { useMyTasksPage } from '../hooks/useMyTasksPage';
import { MyTasksKanbanBoard } from '../components/MyTasksKanbanBoard';
import { MyTasksProjectSection } from '../components/MyTasksProjectSection';
import { MyTasksProjectFilter } from '../components/MyTasksProjectFilter';
import type { MyTask, TaskPhase } from '../types/myTasks.types';
import { isEditableMyTask } from '../utils/myTasks.utils';

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
    perProjectData,
    isLoading,
    isError,
    errorStatus,
    updateStatus,
    updatePhase,
    getTaskId,
  } = useMyTasksPage(isAr, { routeProjectId });

  function handleOpen(task: MyTask) {
    if (!config || !tasksRole) return;
    if (!isEditableMyTask(task)) {
      toast.info(
        isAr
          ? 'يمكنك فقط عرض ملخص مهمة الشريك من اللوحة'
          : 'You can only view a summary of a partner task on the board',
      );
      return;
    }
    const pid = task.project?.id ?? (projectId || undefined);
    if (!pid) return;
    navigate(config.taskDetailPath(pid, getTaskId(task)));
  }

  async function handleStatusChange(task: MyTask, toStatus: string, pid: number | string) {
    if (!tasksRole) return;
    if (!isEditableMyTask(task)) {
      toast.info(isAr ? 'لا يمكن تحديث مهام الشركاء' : 'Partner tasks cannot be updated');
      return;
    }
    await updateStatus(pid, getTaskId(task), toStatus);
  }

  async function handlePhaseChange(task: MyTask, toPhase: TaskPhase, pid: number | string) {
    if (!tasksRole) return;
    if (!isEditableMyTask(task)) {
      toast.info(isAr ? 'لا يمكن تحديث مهام الشركاء' : 'Partner tasks cannot be updated');
      return;
    }
    await updatePhase(pid, getTaskId(task), toPhase);
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
      ) : perProjectData && perProjectData.length > 0 ? (
        <div className="space-y-8">
          {perProjectData.map(({ project, data: projectData }) => (
            <MyTasksProjectSection
              key={project.id}
              project={project}
              data={projectData}
              isAr={isAr}
              canDrag={config.canDragStatus}
              onOpen={(task) => handleOpen({ ...task, project: task.project ?? project })}
              onStatusChange={async (task, toStatus) => {
                await handleStatusChange(task, toStatus, project.id);
              }}
              onPhaseChange={async (task, toPhase) => {
                await handlePhaseChange(task, toPhase, project.id);
              }}
            />
          ))}
        </div>
      ) : (
        <MyTasksKanbanBoard
          data={data}
          isAr={isAr}
          showProjectName={config.showProjectName && !projectId}
          canDrag={config.canDragStatus}
          onOpen={handleOpen}
          onStatusChange={async (task, toStatus) => {
            const pid = task.project?.id ?? (projectId || undefined);
            if (!pid) return;
            await handleStatusChange(task, toStatus, pid);
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
