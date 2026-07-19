import { useState, useEffect } from 'react';
import { useQuery }           from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckSquare }  from 'lucide-react';
import { useLang }            from '@/app/providers/LanguageProvider';
import { useAuth }            from '@/modules/auth/context/AuthContext';
import { usePermission }      from '@/shared/hooks/usePermission';
import { ROUTES }             from '@/app/router/routes';
import { toApiArray }         from '@/shared/utils/apiList.utils';
import { extractApiStatus }   from '@/shared/utils/error.utils';
import { EmptyState }         from '@/shared/components/feedback/EmptyState';
import { Button }             from '@/shared/components/ui/Button';
import { excludeSelfFromActors, filterSeoProjectMentions } from '@/shared/utils/chatNormalize.utils';
import { TaskDetailTabs }     from '@/modules/employee/tasks/components/TaskDetailTabs';
import { TaskDetailTimeTracker }  from '@/modules/employee/tasks/components/TaskDetailTimeTracker';
import { TaskDetailComments }     from '@/modules/employee/tasks/components/TaskDetailComments';
import { SeoAttachmentsTab }      from '@/modules/seo-leader/campaigns/components/SeoAttachmentsTab';
import { campaignApi }            from '@/modules/seo-leader/campaigns/api/campaign.api';
import type { Mentionable }       from '@/modules/seo-leader/campaigns/api/campaign.api';
import { useCreateSeoConversation } from '@/modules/seo-member/messages/hooks/useSeoMessages';
import type { TabId }             from '@/modules/employee/tasks/components/TaskDetailTabs';
import type { TaskDetail }        from '@/modules/employee/tasks/types/taskDetail.types';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import {
  useSeoTaskDetail,
  useUpdateSeoTaskStatus,
  useSeoTaskComments,
  useAddSeoTaskComment,
  useUpdateSeoTaskComment,
  useSeoTaskSessions,
  useCreateSeoTaskSession,
  useDeleteSeoTaskSession,
  useUploadSeoTaskAttachments,
  useDeleteSeoTaskAttachment,
} from '../hooks/useSeoTaskDetail';
import { SeoTaskDetailHeader }    from '../components/SeoTaskDetailHeader';
import { SeoTaskDetailInfo }      from '../components/SeoTaskDetailInfo';
import { SeoMemberEditTaskModal } from '../components/SeoMemberEditTaskModal';

export function SeoTaskDetailPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate    = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';
  const { user }    = useAuth();

  const tabParam = searchParams.get('tab');
  const commentParam = searchParams.get('comment') ?? searchParams.get('commentId');
  const initialTab: TabId =
    tabParam === 'comments' || tabParam === 'attachments' || tabParam === 'info' || tabParam === 'time'
      ? tabParam
      : (commentParam ? 'comments' : 'time');

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(commentParam);
  const [editOpen, setEditOpen]   = useState(false);

  useEffect(() => {
    if (tabParam === 'comments' || commentParam) {
      setActiveTab('comments');
      if (commentParam) setHighlightCommentId(commentParam);
    }
  }, [tabParam, commentParam]);

  useEffect(() => {
    if (!commentParam) return;
    // Clear deep-link query once consumed so refresh doesn't re-highlight.
    setSearchParams({}, { replace: true });
  }, [commentParam, setSearchParams]);

  const canEdit = usePermission('edit-seo-tasks');

  const detailQuery = useSeoTaskDetail(projectId, taskId);
  const detailRes = detailQuery.data;
  const isForbidden = extractApiStatus(detailQuery.error) === 403;
  const isError = detailQuery.isError && !isForbidden;
  const detail = detailRes?.task;
  const tabs = detailRes?.tabs;
  const detailReady = !!projectId && !!taskId && !isForbidden;

  const { data: comments = [], isLoading: commentsLoading } = useSeoTaskComments(
    detailReady ? projectId : undefined,
    detailReady ? taskId : undefined,
  );
  const { mutateAsync: addComment } = useAddSeoTaskComment(projectId, taskId, isAr);
  const { mutateAsync: updateComment } = useUpdateSeoTaskComment(projectId, taskId, isAr);
  const { data: timeLogs, isLoading: sessionsLoading } = useSeoTaskSessions(
    detailReady ? projectId : undefined,
    detailReady ? taskId : undefined,
    detail?.allocatedHours ?? 0,
  );
  const sessions = timeLogs?.sessions ?? [];
  const createSessionMutation = useCreateSeoTaskSession(projectId ?? '', taskId ?? '');
  const deleteSessionMutation = useDeleteSeoTaskSession(projectId ?? '', taskId ?? '');
  const { mutate: changeStatus } = useUpdateSeoTaskStatus(projectId, taskId, isAr);
  const { uploadFiles, isUploading, uploadError } = useUploadSeoTaskAttachments(projectId, taskId, isAr);
  const { deleteAttachment, deletingId } = useDeleteSeoTaskAttachment(projectId, taskId, isAr);

  const { data: mentionables = [] } = useQuery({
    queryKey: ['seo-member', 'task-mentionables', projectId],
    queryFn:  () => campaignApi.getMentionables(projectId!)
      .then(r => filterSeoProjectMentions(
        excludeSelfFromActors(toApiArray<Mentionable>(r.data.data), user),
      )),
    enabled:  !!projectId && !isForbidden,
    staleTime: 60_000,
  });
  const { mutateAsync: createConversation } = useCreateSeoConversation(isAr);

  function goBack() {
    navigate(ROUTES.SEO_MEMBER.TASKS);
  }

  function getMentionInfo(ref: MentionRef): ResolvedMention | undefined {
    const m = mentionables.find(x => x.id === ref.id && (x.type ?? 'employee') === ref.type);
    return m ? { id: m.id, type: m.type ?? 'employee', name: m.name } : undefined;
  }

  async function handleMentionStartChat(ref: MentionRef) {
    try {
      const conv = await createConversation({ recipient_type: ref.type, recipient_id: ref.id });
      navigate(`${ROUTES.SEO_MEMBER.MESSAGES}?conversation=${conv.id}`);
    } catch {
      /* toast handled in hook */
    }
  }

  if (isForbidden) {
    return (
      <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
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
      <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
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

  const isLoading = detailQuery.isLoading;

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
        /* detail.status is now the raw admin-configured key (e.g. "in_progress"),
           not the old fixed camelCase enum — coarsen it for this consumer, which
           only needs the 3-state EmpTaskStatus union and doesn't read `status`
           from `task` at all today, so this is a defensive best-effort mapping. */
        status:         detail.status === 'completed' ? 'completed'
                          : detail.status === 'in_progress' ? 'inProgress'
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
        onBack={goBack}
        canEdit={canEdit}
        onEdit={() => setEditOpen(true)}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-visible">
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
              summary={timeLogs ?? null}
              isLoading={isLoading || sessionsLoading}
              isAr={isAr}
              projectId={projectId}
              taskId={taskId}
              portal="seo"
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
              onSend={(payload) => addComment(payload)}
              onEdit={(payload) => updateComment(payload)}
              mentionables={mentionables.map(m => ({
                id: m.id,
                name: m.name,
                type: m.type ?? 'employee',
              }))}
              getMentionInfo={getMentionInfo}
              onMentionStartChat={handleMentionStartChat}
              highlightCommentId={highlightCommentId}
            />
          )}
        </div>
      </div>

      <SeoMemberEditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={detail}
        projectId={projectId}
        taskId={taskId}
        isAr={isAr}
      />
    </div>
  );
}
