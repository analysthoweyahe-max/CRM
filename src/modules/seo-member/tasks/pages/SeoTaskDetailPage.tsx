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
import { useSeoTaskDetail }       from '../hooks/useSeoTaskDetail';
import { SeoTaskDetailHeader }    from '../components/SeoTaskDetailHeader';
import { SeoTaskDetailInfo }      from '../components/SeoTaskDetailInfo';

export function SeoTaskDetailPage() {
  const { taskId }  = useParams<{ taskId: string }>();
  const navigate    = useNavigate();
  const { lang }    = useLang();
  const isAr        = lang === 'ar';

  const [activeTab, setActiveTab] = useState<TabId>('time');

  const { data, isLoading } = useSeoTaskDetail(taskId);
  const detail   = data?.detail;
  const sessions = data?.sessions  ?? [];
  const comments = data?.comments  ?? [];

  // Adapt SeoTaskDetail → TaskDetail shape for the reused TaskDetailTimeTracker
  const taskDetailAdapter: TaskDetail | undefined = detail
    ? {
        id:               String(detail.id),
        titleAr:          detail.title,
        titleEn:          detail.title,
        descriptionAr:    detail.description ?? '',
        descriptionEn:    detail.description ?? '',
        projectAr:        detail.phase ?? detail.taskTypeLabel,
        projectEn:        detail.phase ?? detail.taskTypeLabel,
        stage:            detail.phase ?? '',
        assigneeAr:       detail.assignees[0]?.name ?? '—',
        assigneeEn:       detail.assignees[0]?.name ?? '—',
        assigneeInitials: detail.assignees[0]?.initials ?? '—',
        createdByAr:      detail.createdBy,
        createdByEn:      detail.createdBy,
        startDate:        detail.startDate ?? '',
        deadline:         detail.dueDate ?? '',
        priority:         detail.priority === 'normal' ? 'medium' : (detail.priority as 'high' | 'low'),
        status:           detail.status === 'blocked' ? 'pending' : (detail.status as 'pending' | 'inProgress' | 'completed'),
        allocatedHours:   detail.allocatedHours,
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
              isLoading={isLoading}
              isAr={isAr}
            />
          )}
          {activeTab === 'info' && (
            <SeoTaskDetailInfo task={detail} isLoading={isLoading} isAr={isAr} />
          )}
          {activeTab === 'attachments' && (
            <TaskDetailAttachments isLoading={isLoading} isAr={isAr} />
          )}
          {activeTab === 'comments' && (
            <TaskDetailComments comments={comments} isLoading={isLoading} isAr={isAr} />
          )}
        </div>
      </div>

    </div>
  );
}
