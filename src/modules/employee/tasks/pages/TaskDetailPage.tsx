import { Lock, CheckSquare } from 'lucide-react';
import { Card }                    from '@/shared/components/ui/Card';
import { EmptyState }               from '@/shared/components/feedback/EmptyState';
import { Button }                   from '@/shared/components/ui/Button';
import { usePermission }            from '@/shared/hooks/usePermission';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useTaskDetailPage }        from './useTaskDetailPage';
import { empProjectMessagesApi }    from '@/modules/employee/projects/api/projectMessages.api';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { excludeSelfFromActors, filterPmProjectMentions } from '@/shared/utils/chatNormalize.utils';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import type { PmMentionable } from '@/modules/employee/projects/types/projectMessage.types';
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
    isEditOpen, openEdit, closeEdit, isForbidden, isError,
  } = useTaskDetailPage();

  const { user } = useAuth();
  const canEdit = usePermission('edit-pm-tasks');

  const { data: mentionables = [] } = useQuery({
    queryKey: ['emp-task-mentionables', projectId],
    queryFn:  () => empProjectMessagesApi.mentionables(projectId)
      .then(r => filterPmProjectMentions(
        excludeSelfFromActors(toApiArray<PmMentionable>(r.data.data), user),
      )),
    enabled:  !!projectId && !isForbidden,
    staleTime: 60_000,
  });

  function getMentionInfo(ref: MentionRef): ResolvedMention | undefined {
    const m = mentionables.find(x => x.id === ref.id && (x.type ?? 'employee') === ref.type);
    return m ? { id: m.id, type: m.type ?? 'employee', name: m.name } : undefined;
  }

  if (isForbidden) {
    return (
      <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
        <EmptyState
          icon={<Lock size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
          title={isAr ? 'مهمة شريك — للعرض فقط' : 'Partner task — view only'}
          description={isAr
            ? 'يمكنك رؤية ملخص مهام زملائك في اللوحة فقط. لا يمكن فتح التفاصيل أو تعديل مهام الشركاء.'
            : 'You can see a summary of teammates’ tasks on the board only. Partner task details and edits are not available.'}
          action={
            <Button variant="secondary" onClick={goBack}>
              {isAr ? 'العودة إلى مهامي' : 'Back to My Tasks'}
            </Button>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
        <EmptyState
          icon={<CheckSquare size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
          title={isAr ? 'تعذر تحميل المهمة' : 'Failed to load task'}
          description={isAr ? 'حدث خطأ أثناء جلب تفاصيل المهمة. حاول مرة أخرى.' : 'An error occurred while loading this task. Please try again.'}
          action={
            <Button variant="secondary" onClick={goBack}>
              {isAr ? 'العودة إلى مهامي' : 'Back to My Tasks'}
            </Button>
          }
        />
      </div>
    );
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
