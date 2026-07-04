import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useEmpDashboard } from '@/modules/employee/dashboard/hooks/useEmpDashboard';
import { useEmployeeTasks, useCreateSelfTask } from '../hooks/useEmployeeTasks';
import type { CreateSelfTaskPayload } from '../types/employeeTask.types';

type Priority = CreateSelfTaskPayload['priority'];

export function useAddTaskModal(onClose: () => void, isAr: boolean) {
  const { projects } = useEmpDashboard();
  const { data: allTasks = [] } = useEmployeeTasks();
  const { mutate: create, isPending: creating } = useCreateSelfTask();

  const [projectId,      setProjectId]      = useState('');
  const [phaseId,        setPhaseId]        = useState('');
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<Priority>('normal');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  function reset() {
    setProjectId(''); setPhaseId(''); setTitle(''); setDescription('');
    setPriority('normal'); setDueDate(''); setEstimatedHours('');
  }

  function handleClose() { reset(); onClose(); }

  const projectItems = useMemo(
    () => projects.map(p => ({ id: String(p.id), label: p.name })),
    [projects],
  );

  const phaseItems = useMemo(() => {
    const phases = new Map<string, string>();
    allTasks
      .filter(t => t.projectId === projectId && t.phaseId)
      .forEach(t => phases.set(t.phaseId!, t.phaseName ?? t.phaseId!));
    return [...phases.entries()].map(([id, label]) => ({ id, label }));
  }, [allTasks, projectId]);

  const priorityItems = [
    { id: 'low',    label: isAr ? 'منخفضة' : 'Low'    },
    { id: 'normal', label: isAr ? 'عادية'   : 'Normal' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
  ];

  const isValid = !!projectId && title.trim().length > 0;

  function handleSubmit() {
    if (!isValid || creating) return;

    const payload: CreateSelfTaskPayload = {
      title: title.trim(),
      priority,
      ...(description.trim()   ? { description: description.trim() } : {}),
      ...(dueDate               ? { due_date: dueDate } : {}),
      ...(estimatedHours        ? { estimated_hours: Number(estimatedHours) } : {}),
      ...(phaseId               ? { phase_id: Number(phaseId) } : {}),
    };

    create(
      { projectId, payload },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم إضافة المهمة بنجاح' : 'Task added successfully');
          handleClose();
        },
        onError: () => toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred'),
      },
    );
  }

  return {
    projectId, setProjectId, projectItems,
    phaseId, setPhaseId, phaseItems,
    title, setTitle,
    description, setDescription,
    priority, setPriority, priorityItems,
    dueDate, setDueDate,
    estimatedHours, setEstimatedHours,
    isValid, creating,
    handleSubmit, handleClose,
  };
}
