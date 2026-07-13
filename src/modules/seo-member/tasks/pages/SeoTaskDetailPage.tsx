import { useState }          from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang }            from '@/app/providers/LanguageProvider';
import { usePermission }      from '@/shared/hooks/usePermission';
import { ROUTES }             from '@/app/router/routes';
import { TaskDetailTabs }     from '@/modules/employee/tasks/components/TaskDetailTabs';
import { TaskDetailTimeTracker }  from '@/modules/employee/tasks/components/TaskDetailTimeTracker';
import { TaskDetailComments }     from '@/modules/employee/tasks/components/TaskDetailComments';
import { SeoAttachmentsTab }      from '@/modules/seo-leader/campaigns/components/SeoAttachmentsTab';
import type { TabId }             from '@/modules/employee/tasks/components/TaskDetailTabs';
import type { TaskDetail }        from '@/modules/employee/tasks/types/taskDetail.types';
import {
  useSeoTaskDetail,
  useUpdateSeoTaskStatus,
  useSeoTaskComments,
  useAddSeoTaskComment,
  useSeoTaskSessions,
  useCreateSeoTaskSession,
  useDeleteSeoTaskSession,
  useUploadSeoTaskAttachments,
  useDeleteSeoTaskAttachment,
} from '../hooks/useSeoTaskDetail';
import { SeoTaskDetailHeader }    from '../components/SeoTaskDetailHeader';
import { SeoTaskDetailInfo }      from '../components/SeoTaskDetailInfo';

export function SeoTaskDetailPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate    = useNavigate();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';

  const [activeTab, setActiveTab] = useState<TabId>('time');

  const canEdit = usePermission('edit-seo-tasks');

  const { data: detailRes, isLoading } = useSeoTaskDetail(projectId, taskId);
  const detail = detailRes?.task;
  const tabs = detailRes?.tabs;

  const { data: comments = [], isLoading: commentsLoading } = useSeoTaskComments(projectId, taskId);
  const { mutateAsync: addComment } = useAddSeoTaskComment(projectId, taskId, isAr);
  const { data: sessions = [], isLoading: sessionsLoading } = useSeoTaskSessions(projectId, taskId);
  const createSessionMutation = useCreateSeoTaskSession(projectId ?? '', taskId ?? '');
  const deleteSessionMutation = useDeleteSeoTaskSession(projectId ?? '', taskId ?? '');
  const { mutate: changeStatus } = useUpdateSeoTaskStatus(projectId, taskId, isAr);
  const { uploadFiles, isUploading, uploadError } = useUploadSeoTaskAttachments(projectId, taskId, isAr);
  const { deleteAttachment, deletingId } = useDeleteSeoTaskAttachment(projectId, taskId, isAr);

  const taskDetailAdapter: TaskDetail | undefined = detail
    ? {
        id:             String(detail.id),
        projectId:      projectId ?? '',
        title:          detail.title,
        description:    detail.description ?? '',
        project:        detail.phase ?? detail.taskTypeLabel,
        stage:          detail.phase,
        createdAt:      detail.startDate,
        deadline:       detail.dueDate ?? '',
        priority:       detail.priority === 'normal' ? 'medium' : (detail.priority as 'high' | 'low'),
        status:         detail.status === 'pending' || detail.status === 'inProgress' || detail.status === 'completed'
                          ? detail.status
                          : 'pending',
        allocatedHours: detail.allocatedHours,
      }
    : undefined;

  const tabCounts = {
    attachments: detail?.attachmentsCount ?? tabs?.attachmentsCount ?? detail?.attachments?.length ?? 0,
    comments:    tabs?.commentsCount ?? comments.length,
  };

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <SeoTaskDetailHeader
        task={detail}
        isLoading={isLoading}
        isAr={isAr}
        onBack={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <TaskDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAr={isAr}
          counts={tabCounts}
        />

        <div className="p-5">
          {activeTab === 'time' && (
            <TaskDetailTimeTracker
              task={taskDetailAdapter}
              sessions={sessions}
              isLoading={isLoading || sessionsLoading}
              isAr={isAr}
              projectId={projectId}
              taskId={taskId}
              onCreateSession={(payload, opts) => createSessionMutation.mutate(payload, opts)}
              onDeleteSession={id => deleteSessionMutation.mutate(id)}
              creatingSession={createSessionMutation.isPending}
              deletingSession={deleteSessionMutation.isPending}
            />
          )}
          {activeTab === 'info' && (
            <SeoTaskDetailInfo task={detail} isLoading={isLoading} isAr={isAr} onStatusChange={changeStatus} canEdit={canEdit} />
          )}
          {activeTab === 'attachments' && (
            <SeoAttachmentsTab
              attachments={detail?.attachments ?? []}
              onUploadFiles={uploadFiles}
              onDelete={deleteAttachment}
              isUploading={isUploading}
              deletingId={deletingId}
              isAr={isAr}
              uploadError={uploadError}
            />
          )}
          {activeTab === 'comments' && (
            <TaskDetailComments
              comments={comments}
              isLoading={isLoading || commentsLoading}
              isAr={isAr}
              onSend={(body) => addComment(body)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
