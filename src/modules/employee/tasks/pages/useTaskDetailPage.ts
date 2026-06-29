import { useState }               from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang }                from '@/app/providers/LanguageProvider';
import { ROUTES }                 from '@/app/router/routes';
import { useTaskDetail, useTaskComments, useTaskSessions } from '../hooks/useTaskDetail';
import type { TabId } from '../components/TaskDetailTabs';

export function useTaskDetailPage() {
  const { id = '' }  = useParams<{ id: string }>();
  const { lang }     = useLang();
  const isAr         = lang === 'ar';
  const navigate     = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('comments');

  const { data: task,     isLoading: tl } = useTaskDetail(id);
  const { data: comments = [], isLoading: cl } = useTaskComments(id);
  const { data: sessions = [], isLoading: sl } = useTaskSessions(id);

  const isLoading = tl || cl || sl;

  function goBack() { navigate(ROUTES.EMPLOYEE.TASKS); }

  return { isAr, goBack, activeTab, setActiveTab, task, comments, sessions, isLoading };
}
