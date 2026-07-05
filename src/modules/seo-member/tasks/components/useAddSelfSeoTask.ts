import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { useSeoTasks } from '../hooks/useSeoTasks';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { CreateSelfSeoTaskPayload, SeoTaskPriority } from '../types/seoTask.types';

export function useAddSelfSeoTask(onClose: () => void, isAr: boolean) {
  const { data } = useSeoTasks();
  const projects = data?.projects ?? [];
  const qc = useQueryClient();

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateSelfSeoTaskPayload }) =>
      seoTaskDetailApi.createSelfTask(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] }),
  });

  const [projectId,      setProjectId]      = useState('');
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<SeoTaskPriority>('normal');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  function reset() {
    setProjectId(''); setTitle(''); setDescription('');
    setPriority('normal'); setDueDate(''); setEstimatedHours('');
  }

  function handleClose() { reset(); onClose(); }

  const projectItems = useMemo(
    () => projects.map((p) => ({ id: p.id, label: p.name })),
    [projects],
  );

  const priorityItems = [
    { id: 'low',    label: isAr ? 'منخفضة' : 'Low'    },
    { id: 'normal', label: isAr ? 'عادية'   : 'Normal' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
  ];

  const isValid = !!projectId && title.trim().length > 0;

  function handleSubmit() {
    if (!isValid || creating) return;

    const payload: CreateSelfSeoTaskPayload = {
      title:    title.trim(),
      priority,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate             ? { due_date: dueDate } : {}),
      ...(estimatedHours      ? { estimated_hours: Number(estimatedHours) } : {}),
    };

    create(
      { projectId, payload },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم إضافة المهمة بنجاح' : 'Task added successfully');
          handleClose();
        },
        onError: (err) => toast.error(extractApiError(err)),
      },
    );
  }

  return {
    projectId, setProjectId, projectItems,
    title, setTitle,
    description, setDescription,
    priority, setPriority, priorityItems,
    dueDate, setDueDate,
    estimatedHours, setEstimatedHours,
    isValid, creating,
    handleSubmit, handleClose,
  };
}
