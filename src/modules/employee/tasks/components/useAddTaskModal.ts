import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { useEmpDashboard } from '@/modules/employee/dashboard/hooks/useEmpDashboard';
import { pmProjectsApi } from '@/modules/project-manager/projects/api/project.api';
import type { PmProjectPhase } from '@/modules/project-manager/projects/types/project.types';
import { useCreateSelfTask } from '../hooks/useEmployeeTasks';
import type { CreateSelfTaskPayload } from '../types/employeeTask.types';

type Priority = 'low' | 'normal' | 'high';

export function useAddTaskModal(onClose: () => void, isAr: boolean) {
  const { projects } = useEmpDashboard();
  const { mutate: create, isPending: creating } = useCreateSelfTask();

  const [projectId,      setProjectIdState] = useState('');
  const [phaseId,        setPhaseId]        = useState('');
  const [title,          setTitleState]     = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<Priority>('normal');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const [touched,         setTouched]         = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function markTouched(field: string) {
    setTouched(prev => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function setProjectId(v: string) { setProjectIdState(v); markTouched('projectId'); }
  function setTitle(v: string)     { setTitleState(v);     markTouched('title'); }

  function reset() {
    setProjectIdState(''); setPhaseId(''); setTitleState(''); setDescription('');
    setPriority('normal'); setDueDate(''); setEstimatedHours('');
    setTouched({}); setSubmitAttempted(false);
  }

  function handleClose() { reset(); onClose(); }

  const projectItems = useMemo(
    () => projects.map(p => ({ id: String(p.id), label: p.name })),
    [projects],
  );

  const { data: projectPhases = [] } = useQuery({
    queryKey: ['pm-project', projectId, 'phases'],
    queryFn:  async () => {
      const res = await pmProjectsApi.phases(projectId);
      return toApiArray<PmProjectPhase>(res.data.data);
    },
    enabled: !!projectId,
  });

  const phaseItems = useMemo(
    () => projectPhases.map(p => ({ id: String(p.id), label: p.name })),
    [projectPhases],
  );

  const priorityItems = [
    { id: 'low',    label: isAr ? 'منخفضة' : 'Low'    },
    { id: 'normal', label: isAr ? 'عادية'   : 'Normal' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
  ];

  const fieldErrors: Record<string, string> = {};
  if (!projectId)         fieldErrors.projectId = isAr ? 'اختر المشروع' : 'Project is required';
  if (!title.trim())      fieldErrors.title     = isAr ? 'العنوان مطلوب' : 'Title is required';

  const isValid = Object.keys(fieldErrors).length === 0;

  const errors: Record<string, string> = {};
  for (const key of Object.keys(fieldErrors)) {
    if (touched[key] || submitAttempted) errors[key] = fieldErrors[key];
  }

  function handleSubmit() {
    setSubmitAttempted(true);
    if (!isValid || creating) return;

    const payload: CreateSelfTaskPayload = {
      title: title.trim(),
      priority,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate            ? { dueDate } : {}),
      ...(estimatedHours     ? { estimatedHours: Number(estimatedHours) } : {}),
      ...(phaseId            ? { phaseId: Number(phaseId) } : {}),
    };

    create(
      { projectId, payload },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم إضافة المهمة بنجاح' : 'Task added successfully');
          handleClose();
        },
        onError: (err) => toast.error(extractApiError(err) || (isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred')),
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
    isValid, errors, creating,
    handleSubmit, handleClose,
  };
}
