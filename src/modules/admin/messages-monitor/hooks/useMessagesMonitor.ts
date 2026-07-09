import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pmProjectsApi } from '@/modules/project-manager/projects/api/project.api';
import { messagesMonitorApi } from '../api/monitor.api';
import { normalizeMonitoredMessages } from '../utils/monitor.utils';

export function useMessagesMonitor(isAr: boolean) {
  const [projectId, setProjectId] = useState('');
  const [source,    setSource]    = useState('');
  const [search,    setSearch]    = useState('');

  const { data: projectsPage } = useQuery({
    queryKey: ['admin', 'messages-monitor', 'projects'],
    queryFn:  () => pmProjectsApi.list({ per_page: 100 }).then((r) => r.data.data),
    staleTime: 60_000,
  });

  const projectItems = (projectsPage?.data ?? []).map((p) => ({
    id:    String(p.id),
    label: p.name,
  }));

  const sourceItems = [
    { id: '',              label: isAr ? 'كل المصادر'       : 'All sources' },
    { id: 'project',       label: isAr ? 'رسائل المشروع'    : 'Project messages' },
    { id: 'client_update', label: isAr ? 'تحديثات العميل'  : 'Client updates' },
  ];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'messages-monitor', 'messages', projectId, source, search],
    queryFn:  async () => {
      const res = projectId
        ? await messagesMonitorApi.projectMessages(projectId, { search: search || undefined, per_page: 50, source: source || undefined })
        : await messagesMonitorApi.list({
            source: source || undefined,
            search: search || undefined,
            per_page: 50,
          });
      return {
        messages: normalizeMonitoredMessages(res.data.data?.data),
        total:    res.data.data?.total ?? 0,
      };
    },
    refetchInterval: 10_000,
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  return {
    messages: data?.messages ?? [],
    total:    data?.total ?? 0,
    isLoading, isFetching,
    projectId, setProjectId,
    source, setSource,
    search, setSearch,
    projectItems, sourceItems,
  };
}
