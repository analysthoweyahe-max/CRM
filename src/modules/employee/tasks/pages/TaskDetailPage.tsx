import { Card }                    from '@/shared/components/ui/Card';
import { useTaskDetailPage }        from './useTaskDetailPage';
import { TaskDetailHeader }         from '../components/TaskDetailHeader';
import { TaskDetailTabs }           from '../components/TaskDetailTabs';
import { TaskDetailComments }       from '../components/TaskDetailComments';
import { TaskDetailInfo }           from '../components/TaskDetailInfo';
import { TaskDetailAttachments }    from '../components/TaskDetailAttachments';
import { TaskDetailTimeTracker }    from '../components/TaskDetailTimeTracker';
import { EditTaskModal }            from '../components/EditTaskModal';

export function TaskDetailPage() {
  const {
    isAr, goBack, activeTab, setActiveTab, task, comments, sessions, isLoading, projectId, taskId,
    isEditOpen, openEdit, closeEdit,
  } = useTaskDetailPage();

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <TaskDetailHeader task={task} isLoading={isLoading} isAr={isAr} onBack={goBack} onEdit={openEdit} />
      {task && <EditTaskModal open={isEditOpen} onClose={closeEdit} task={task} isAr={isAr} />}
      <Card>
        <TaskDetailTabs activeTab={activeTab} onTabChange={setActiveTab} isAr={isAr} />
        <div className="p-5">
          {activeTab === 'comments'    && (
            <TaskDetailComments
              comments={comments} isLoading={isLoading} isAr={isAr}
              projectId={projectId} taskId={taskId}
            />
          )}
          {activeTab === 'info'        && (
            <TaskDetailInfo
              task={task} isLoading={isLoading} isAr={isAr}
              projectId={projectId} taskId={taskId}
            />
          )}
          {activeTab === 'attachments' && <TaskDetailAttachments                    isLoading={isLoading} isAr={isAr} />}
          {activeTab === 'time'        && (
            <TaskDetailTimeTracker
              task={task} sessions={sessions} isLoading={isLoading} isAr={isAr}
              projectId={projectId} taskId={taskId}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
