import { useState }               from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang }                from '@/app/providers/LanguageProvider';
import { ROUTES }                 from '@/app/router/routes';
import { useTaskDetail, useTaskComments, useTaskSessions } from '../hooks/useTaskDetail';
import type { TabId } from '../components/TaskDetailTabs';

export function useTaskDetailPage() {
  const { projectId = '', taskId = '' } = useParams<{ projectId: string; taskId: string }>();
  const { lang }     = useLang();
  const isAr         = lang === 'ar';
  const navigate     = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('comments');

  const { data: task,     isLoading: tl } = useTaskDetail(projectId, taskId);
  const { data: comments = [], isLoading: cl } = useTaskComments(projectId, taskId);
  const { data: sessions = [], isLoading: sl } = useTaskSessions(projectId, taskId);

  const isLoading = tl || cl || sl;

  function goBack() { navigate(ROUTES.EMPLOYEE.TASKS); }

  return { isAr, goBack, activeTab, setActiveTab, task, comments, sessions, isLoading, projectId, taskId };
}
