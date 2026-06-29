import { Card }                    from '@/shared/components/ui/Card';
import { useTaskDetailPage }        from './useTaskDetailPage';
import { TaskDetailHeader }         from '../components/TaskDetailHeader';
import { TaskDetailTabs }           from '../components/TaskDetailTabs';
import { TaskDetailComments }       from '../components/TaskDetailComments';
import { TaskDetailInfo }           from '../components/TaskDetailInfo';
import { TaskDetailAttachments }    from '../components/TaskDetailAttachments';
import { TaskDetailTimeTracker }    from '../components/TaskDetailTimeTracker';

export function TaskDetailPage() {
  const { isAr, goBack, activeTab, setActiveTab, task, comments, sessions, isLoading } = useTaskDetailPage();

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <TaskDetailHeader task={task} isLoading={isLoading} isAr={isAr} onBack={goBack} />
      <Card>
        <TaskDetailTabs activeTab={activeTab} onTabChange={setActiveTab} isAr={isAr} />
        <div className="p-5">
          {activeTab === 'comments'    && <TaskDetailComments    comments={comments} isLoading={isLoading} isAr={isAr} />}
          {activeTab === 'info'        && <TaskDetailInfo        task={task}        isLoading={isLoading} isAr={isAr} />}
          {activeTab === 'attachments' && <TaskDetailAttachments                    isLoading={isLoading} isAr={isAr} />}
          {activeTab === 'time'        && <TaskDetailTimeTracker task={task} sessions={sessions} isLoading={isLoading} isAr={isAr} />}
        </div>
      </Card>
    </div>
  );
}
