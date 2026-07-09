import { useState }          from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang }            from '@/app/providers/LanguageProvider';
import { ROUTES }             from '@/app/router/routes';
import { TaskDetailTabs }     from '@/modules/employee/tasks/components/TaskDetailTabs';
import { TaskDetailTimeTracker }  from '@/modules/employee/tasks/components/TaskDetailTimeTracker';
import { TaskDetailAttachments }  from '@/modules/employee/tasks/components/TaskDetailAttachments';
import { TaskDetailComments }     from '@/modules/employee/tasks/components/TaskDetailComments';
import type { TabId }             from '@/modules/employee/tasks/components/TaskDetailTabs';
import type { TaskDetail }        from '@/modules/employee/tasks/types/taskDetail.types';
import {
  useSeoTaskDetail,
  useUpdateSeoTaskStatus,
  useSeoTaskComments,
  useSeoTaskSessions,
} from '../hooks/useSeoTaskDetail';
import { SeoTaskDetailHeader }    from '../components/SeoTaskDetailHeader';
import { SeoTaskDetailInfo }      from '../components/SeoTaskDetailInfo';

export function SeoTaskDetailPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate    = useNavigate();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';

  const [activeTab, setActiveTab] = useState<TabId>('time');

  const { data: detail, isLoading } = useSeoTaskDetail(projectId, taskId);
  const { data: comments = [], isLoading: commentsLoading } = useSeoTaskComments(projectId, taskId);
  const { data: sessions = [], isLoading: sessionsLoading } = useSeoTaskSessions(projectId, taskId);
  const { mutate: changeStatus } = useUpdateSeoTaskStatus(projectId, taskId, isAr);

  const taskDetailAdapter: TaskDetail | undefined = detail
    ? {
        id:             detail.uuid ?? String(detail.id),
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

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <SeoTaskDetailHeader
        task={detail}
        isLoading={isLoading}
        isAr={isAr}
        onBack={() => navigate(ROUTES.SEO_MEMBER.TASKS)}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <TaskDetailTabs activeTab={activeTab} onTabChange={setActiveTab} isAr={isAr} />

        <div className="p-5">
          {activeTab === 'time' && (
            <TaskDetailTimeTracker
              task={taskDetailAdapter}
              sessions={sessions}
              isLoading={isLoading || sessionsLoading}
              isAr={isAr}
            />
          )}
          {activeTab === 'info' && (
            <SeoTaskDetailInfo task={detail} isLoading={isLoading} isAr={isAr} onStatusChange={changeStatus} />
          )}
          {activeTab === 'attachments' && (
            <TaskDetailAttachments isLoading={isLoading} isAr={isAr} />
          )}
          {activeTab === 'comments' && (
            <TaskDetailComments
              comments={comments}
              isLoading={isLoading || commentsLoading}
              isAr={isAr}
            />
          )}
        </div>
      </div>
    </div>
  );
}
