import { Card }                    from '@/shared/components/ui/Card';
import { usePermission }            from '@/shared/hooks/usePermission';
import { useQuery } from '@tanstack/react-query';
import { useTaskDetailPage }        from './useTaskDetailPage';
import { empProjectMessagesApi }    from '@/modules/employee/projects/api/projectMessages.api';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import { TaskDetailHeader }         from '../components/TaskDetailHeader';
import { TaskDetailTabs }           from '../components/TaskDetailTabs';
import { TaskDetailComments }       from '../components/TaskDetailComments';
import { TaskDetailInfo }           from '../components/TaskDetailInfo';
import { TaskDetailAttachments }    from '../components/TaskDetailAttachments';
import { TaskDetailTimeTracker }    from '../components/TaskDetailTimeTracker';
import { EditTaskModal }            from '../components/EditTaskModal';

export function TaskDetailPage() {
  const {
    isAr, goBack, activeTab, setActiveTab, task, comments, sessions, timeLogs, isLoading, projectId, taskId,
    isEditOpen, openEdit, closeEdit,
  } = useTaskDetailPage();

  const canEdit = usePermission('edit-pm-tasks');

  const { data: mentionables = [] } = useQuery({
    queryKey: ['emp-task-mentionables', projectId],
    queryFn:  () => empProjectMessagesApi.mentionables(projectId).then(r => r.data.data),
    enabled:  !!projectId,
    staleTime: 60_000,
  });

  function getMentionInfo(ref: MentionRef): ResolvedMention | undefined {
    const m = mentionables.find(x => x.id === ref.id && (x.type ?? 'employee') === ref.type);
    return m ? { id: m.id, type: m.type ?? 'employee', name: m.name } : undefined;
  }

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <TaskDetailHeader task={task} isLoading={isLoading} isAr={isAr} onBack={goBack} onEdit={openEdit} canEdit={canEdit} />
      {task && canEdit && <EditTaskModal open={isEditOpen} onClose={closeEdit} task={task} isAr={isAr} />}
      <Card>
        <TaskDetailTabs activeTab={activeTab} onTabChange={setActiveTab} isAr={isAr} />
        <div className="p-5">
          {activeTab === 'comments'    && (
            <TaskDetailComments
              comments={comments} isLoading={isLoading} isAr={isAr}
              projectId={projectId} taskId={taskId}
              mentionables={mentionables.map(m => ({
                id: m.id,
                name: m.name,
                type: m.type ?? 'employee',
              }))}
              getMentionInfo={getMentionInfo}
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
              task={task} sessions={sessions} summary={timeLogs ?? null}
              isLoading={isLoading} isAr={isAr}
              projectId={projectId} taskId={taskId}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
