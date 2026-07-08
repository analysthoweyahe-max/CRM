import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pmProjectsApi } from '@/modules/project-manager/projects/api/project.api';
import { messagesMonitorApi } from '../api/monitor.api';

const SOURCE_OPTIONS = ['pm', 'seo'] as const;

export function useMessagesMonitor(isAr: boolean) {
  const [projectId, setProjectId] = useState('');
  const [source,    setSource]    = useState('');
  const [search,    setSearch]    = useState('');

  const { data: projectsPage } = useQuery({
    queryKey: ['admin', 'messages-monitor', 'projects'],
    queryFn:  () => pmProjectsApi.list({ per_page: 100 }).then((r) => r.data.data),
    staleTime: 60_000,
  });

  const projectItems = (projectsPage?.data ?? []).map((p) => ({ id: String(p.id), label: p.name }));
  const sourceItems = SOURCE_OPTIONS.map((s) => ({
    id: s,
    label: s === 'pm' ? (isAr ? 'مشاريع البرمجة' : 'PM Projects') : (isAr ? 'مشاريع السيو' : 'SEO Projects'),
  }));

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'messages-monitor', 'messages', projectId, source, search],
    queryFn:  () => (
      projectId
        ? messagesMonitorApi.projectMessages(projectId, { search: search || undefined, per_page: 50 })
        : messagesMonitorApi.list({
            source: source || undefined,
            search: search || undefined,
            per_page: 50,
          })
    ).then((r) => r.data.data),
    refetchInterval: 15_000,
  });

  return {
    messages: data?.data ?? [],
    total:    data?.total ?? 0,
    isLoading, isFetching,
    projectId, setProjectId,
    source, setSource,
    search, setSearch,
    projectItems, sourceItems,
  };
}
