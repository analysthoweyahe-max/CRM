import { useState }               from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang }                from '@/app/providers/LanguageProvider';
import { ROUTES }                 from '@/app/router/routes';
import { extractApiStatus }       from '@/shared/utils/error.utils';
import { useTaskDetail, useTaskComments, useTaskSessions } from '../hooks/useTaskDetail';
import type { TabId } from '../components/TaskDetailTabs';

export function useTaskDetailPage() {
  const { projectId = '', taskId = '' } = useParams<{ projectId: string; taskId: string }>();
  const { lang }     = useLang();
  const isAr         = lang === 'ar';
  const navigate     = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('comments');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const detailQuery = useTaskDetail(projectId, taskId);
  const task = detailQuery.data;
  const detailForbidden = extractApiStatus(detailQuery.error) === 403;
  const detailReady = !!projectId && !!taskId && !detailForbidden;

  const { data: comments = [], isLoading: cl } = useTaskComments(
    detailReady ? projectId : '',
    detailReady ? taskId : '',
  );
  const { data: timeLogs, isLoading: sl } = useTaskSessions(
    detailReady ? projectId : '',
    detailReady ? taskId : '',
    task?.allocatedHours ?? 0,
  );
  const sessions = timeLogs?.sessions ?? [];

  // Don't wait on nested tabs when detail itself is forbidden (partner deep-link).
  const isLoading = detailForbidden
    ? false
    : (detailQuery.isLoading || cl || sl);

  function goBack() { navigate(ROUTES.EMPLOYEE.TASKS); }

  return {
    isAr, goBack, activeTab, setActiveTab, task, comments, sessions, timeLogs, isLoading, projectId, taskId,
    isEditOpen, openEdit: () => setIsEditOpen(true), closeEdit: () => setIsEditOpen(false),
    isForbidden: detailForbidden,
    isError: detailQuery.isError && !detailForbidden,
  };
}
