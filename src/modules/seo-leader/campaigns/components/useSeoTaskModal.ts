import { useState, useEffect }           from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi }                    from '../api/campaign.api';
import type { SeoTaskTab }                from './SeoTaskModal.types';

export function useSeoTaskModal(
  projectId: string,
  taskId:    string | null,
) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SeoTaskTab>('info');

  /* ── Editable form state ──────────────────────────────────────────── */
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState('medium');
  const [stage,          setStage]          = useState('');
  const [status,         setStatus]         = useState('');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [targetKeyword,  setTargetKeyword]  = useState('');
  const [targetUrl,      setTargetUrl]      = useState('');

  /* ── Fetch full task details ──────────────────────────────────────── */
  const { data: task, isLoading } = useQuery({
    queryKey: ['seo-task', projectId, taskId],
    queryFn:  () => campaignApi.getTask(projectId, taskId!).then(r => r.data.data),
    enabled:  !!taskId && !!projectId,
    staleTime: 30_000,
  });

  /* ── Populate form when data arrives ─────────────────────────────── */
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description  ?? '');
    setPriority(task.priority        ?? 'medium');
    setStage(task.stage ?? task.phase ?? '');
    setStatus(task.status            ?? '');
    setDueDate(task.dueDate          ?? '');
    setEstimatedHours(task.estimatedHours ? String(task.estimatedHours) : '');
    setTargetKeyword(task.targetKeyword  ?? '');
    setTargetUrl(task.targetUrl         ?? '');
  }, [task]);

  /* ── Update task info ─────────────────────────────────────────────── */
  const saveMutation = useMutation({
    mutationFn: () => campaignApi.updateTask(projectId, taskId!, {
      title:           title.trim(),
      description:     description.trim() || undefined,
      priority,
      status,
      dueDate:         dueDate || undefined,
      estimatedHours:  estimatedHours ? Number(estimatedHours) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
    },
  });

  /* ── Remove assignee ──────────────────────────────────────────────── */
  const removeAssigneeMutation = useMutation({
    mutationFn: (assigneeId: string) => {
      const remaining = (task?.assignees ?? [])
        .filter(a => a.id !== assigneeId)
        .map(a => a.id);
      return campaignApi.updateAssignees(projectId, taskId!, remaining);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
    },
  });

  /* ── Upload attachment ────────────────────────────────────────────── */
  const uploadMutation = useMutation({
    mutationFn: (file: File) => campaignApi.uploadAttachment(projectId, taskId!, file),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
    },
  });

  /* ── Reset tab on task change ─────────────────────────────────────── */
  useEffect(() => { setTab('info'); }, [taskId]);

  return {
    task,
    isLoading,
    tab,
    setTab,
    /* form fields */
    title,         setTitle,
    description,   setDescription,
    priority,      setPriority,
    stage,         setStage,
    status,        setStatus,
    dueDate,       setDueDate,
    estimatedHours, setEstimatedHours,
    targetKeyword, setTargetKeyword,
    targetUrl,     setTargetUrl,
    /* actions */
    handleSave:      () => saveMutation.mutate(),
    isSaving:        saveMutation.isPending,
    removeAssignee:  (id: string) => removeAssigneeMutation.mutate(id),
    isRemoving:      removeAssigneeMutation.isPending,
    uploadFile:      (file: File) => uploadMutation.mutate(file),
    isUploading:     uploadMutation.isPending,
  };
}
