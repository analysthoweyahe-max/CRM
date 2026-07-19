import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { normalizeImportantLinks, validateImportantLinks } from '@/shared/utils/importantLinks.utils';
import { useSeoMemberDashboard } from '../../dashboard/hooks/useSeoMemberDashboard';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { CreateSelfSeoTaskPayload, SeoTaskPriority } from '../types/seoTask.types';

interface Options {
  initialProjectId?: string;
  lockProject?:      boolean;
}

export function useAddSelfSeoTask(onClose: () => void, isAr: boolean, options: Options = {}) {
  /* Projects come from the dashboard's "my projects" list — not derived from
     existing tasks, since a member with zero tasks would otherwise never
     see any project to pick from. */
  const { sections } = useSeoMemberDashboard();
  const projects = useMemo(() => sections.flatMap((s) => s.projects), [sections]);
  const qc = useQueryClient();

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: ({ projectId, payload, files }: { projectId: string; payload: CreateSelfSeoTaskPayload; files?: File[] }) =>
      seoTaskDetailApi.createSelfTask(projectId, payload, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member-project-tasks'] });
    },
  });

  const [projectId,      setProjectIdState] = useState(options.initialProjectId ?? '');
  const [title,          setTitleState]     = useState('');
  const [phase,          setPhaseState]     = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<SeoTaskPriority>('normal');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [importantLinks, setImportantLinks] = useState<string[]>([]);
  const [files,          setFiles]          = useState<File[]>([]);
  const [fileError,      setFileError]      = useState<string | null>(null);

  const [touched,         setTouched]         = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function markTouched(field: string) {
    setTouched(prev => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function setProjectId(v: string) { setProjectIdState(v); markTouched('projectId'); }
  function setTitle(v: string)     { setTitleState(v);     markTouched('title'); }
  function setPhase(v: string)     { setPhaseState(v);     markTouched('phase'); }

  useEffect(() => {
    if (options.initialProjectId) setProjectIdState(options.initialProjectId);
  }, [options.initialProjectId]);

  function reset() {
    setProjectIdState(options.lockProject ? (options.initialProjectId ?? '') : '');
    setTitleState(''); setPhaseState(''); setDescription('');
    setPriority('normal'); setDueDate(''); setEstimatedHours('');
    setImportantLinks([]);
    setFiles([]); setFileError(null);
    setTouched({}); setSubmitAttempted(false);
  }

  function handleClose() { reset(); onClose(); }

  const projectItems = useMemo(
    () => projects.map((p) => ({ id: String(p.id), label: p.name })),
    [projects],
  );

  const priorityItems = [
    { id: 'low',    label: isAr ? 'منخفضة' : 'Low'    },
    { id: 'normal', label: isAr ? 'عادية'   : 'Normal' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
  ];

  const fieldErrors: Record<string, string> = {};
  if (!projectId)      fieldErrors.projectId = isAr ? 'اختر المشروع' : 'Project is required';
  if (!title.trim())   fieldErrors.title     = isAr ? 'العنوان مطلوب' : 'Title is required';
  if (!phase.trim())   fieldErrors.phase     = isAr ? 'المرحلة مطلوبة' : 'Phase is required';
  const linksError = validateImportantLinks(importantLinks, isAr);
  if (linksError) fieldErrors.importantLinks = linksError;

  const isValid = Object.keys(fieldErrors).length === 0;

  const errors: Record<string, string> = {};
  for (const key of Object.keys(fieldErrors)) {
    if (touched[key] || submitAttempted) errors[key] = fieldErrors[key];
  }

  function handleSubmit() {
    setSubmitAttempted(true);
    if (!isValid || creating) return;

    const links = normalizeImportantLinks(importantLinks);
    const payload: CreateSelfSeoTaskPayload = {
      title:    title.trim(),
      phase:    phase.trim(),
      priority,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate             ? { due_date: dueDate } : {}),
      ...(estimatedHours      ? { estimated_hours: Number(estimatedHours) } : {}),
      ...(links.length        ? { importantLinks: links } : {}),
    };

    create(
      { projectId, payload, files: files.length ? files : undefined },
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
    lockProject: Boolean(options.lockProject),
    title, setTitle,
    phase, setPhase,
    description, setDescription,
    priority, setPriority, priorityItems,
    dueDate, setDueDate,
    estimatedHours, setEstimatedHours,
    importantLinks, setImportantLinks,
    files, setFiles, fileError, setFileError,
    isValid, errors, creating,
    handleSubmit, handleClose,
  };
}
