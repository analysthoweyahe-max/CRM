import { useState, useEffect }                  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }                                 from 'sonner';
import { extractApiError }                       from '@/shared/utils/error.utils';
import { campaignApi }                           from '../api/campaign.api';
import type { SeoComment }                       from '../api/campaign.api'; // used in extractComments + toTaskComment
import type { SeoDrawerTab }                     from './SeoTaskModal.types';
import type { ComboboxItem }                     from '@/shared/components/form/Combobox';
import type { TaskComment, TimeSession }         from '@/modules/project-manager/tasks/types/taskModal.types';

/* ── Helpers ─────────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['bg-violet-500','bg-sky-500','bg-amber-500','bg-rose-500','bg-teal-500','bg-indigo-500'];
function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtDateLabel(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

/* Backend: { data: { data: [...comments], current_page, last_page, total } }
   After .then(r => r.data.data) the value is the paginated wrapper object.     */
function extractComments(raw: unknown): SeoComment[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as SeoComment[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as SeoComment[];
  return [];
}

function toTaskComment(c: SeoComment): TaskComment {
  const name = c.sender?.name ?? 'مجهول';
  return {
    id:            String(c.id),
    author:        name,
    authorInitial: name[0]?.toUpperCase() ?? '?',
    authorColor:   colorFor(name),
    text:          c.body,
    dateLabel:     fmtDateLabel(c.sentAt),
  };
}

/* ── Hook ────────────────────────────────────────────────────────────── */
export function useSeoTaskDrawer(
  projectId: string,
  taskId:    string | null,
  isAr:      boolean,
) {
  const queryClient = useQueryClient();

  /* ── Tab ───────────────────────────────────────────────────────────── */
  const [tab,        setTab]        = useState<SeoDrawerTab>('info');
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ── Form state ─────────────────────────────────────────────────────── */
  const [description,       setDescription]       = useState('');
  const [taskType,          setTaskType]           = useState('');
  const [priority,          setPriority]           = useState('medium');
  const [status,            setStatus]             = useState('pending');
  const [startDate,         setStartDate]          = useState('');
  const [dueDate,           setDueDate]            = useState('');
  const [assigneeId,        setAssigneeId]         = useState('');
  const [targetUrl,         setTargetUrl]          = useState('');
  const [targetKeyword,     setTargetKeyword]      = useState('');
  const [searchIntent,      setSearchIntent]       = useState('');
  const [searchVolume,      setSearchVolume]       = useState('');
  const [keywordDifficulty, setKeywordDifficulty]  = useState('');
  const [metaTitle,         setMetaTitle]          = useState('');
  const [metaDescription,   setMetaDescription]    = useState('');
  const [siteLinks,         setSiteLinks]          = useState<string[]>([]);
  const [referenceLinks,    setReferenceLinks]     = useState<string[]>([]);
  const [notes,             setNotes]              = useState('');
  const [commentText,       setCommentText]        = useState('');

  /* ── Fetch task ─────────────────────────────────────────────────────── */
  const { data: task, isLoading } = useQuery({
    queryKey: ['seo-task', projectId, taskId],
    queryFn:  () => campaignApi.getTask(projectId, taskId!).then(r => r.data.data),
    enabled:  !!taskId && !!projectId,
    staleTime: 30_000,
  });

  /* ── Fetch comments ─────────────────────────────────────────────────── */
  const { data: rawComments } = useQuery({
    queryKey: ['seo-task-comments', projectId, taskId],
    queryFn:  () => campaignApi.getComments(projectId, taskId!).then(r => r.data.data),
    enabled:  !!taskId && !!projectId,
    refetchInterval: 15_000,
  });

  const comments: TaskComment[] = extractComments(rawComments).map(toTaskComment);

  /* ── Populate form ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!task) return;
    setDescription(task.description        ?? '');
    setTaskType(task.taskType              ?? '');
    setPriority(task.priority              ?? 'medium');
    setStatus(task.status                  ?? 'pending');
    setStartDate(task.startDate            ?? '');
    setDueDate(task.dueDate                ?? '');
    setAssigneeId(task.assignees?.[0]?.id  ?? '');
    setTargetUrl(task.targetUrl            ?? '');
    setTargetKeyword(task.targetKeyword    ?? '');
    setSearchIntent(task.searchIntent      ?? '');
    setSearchVolume(task.searchVolume != null ? String(task.searchVolume) : '');
    setKeywordDifficulty(task.keywordDifficulty != null ? String(task.keywordDifficulty) : '');
    setMetaTitle(task.metaTitle            ?? '');
    setMetaDescription(task.metaDescription ?? '');
    setSiteLinks(task.siteLinks            ?? []);
    setReferenceLinks(task.referenceLinks  ?? []);
    setNotes(task.notes                    ?? '');
  }, [task]);

  /* ── Reset tab when opening a different task ────────────────────────── */
  useEffect(() => { setTab('info'); }, [taskId]);

  /* ── Save task ──────────────────────────────────────────────────────── */
  const saveMutation = useMutation({
    mutationFn: () => {
      const next = {
        description:     description.trim() || undefined,
        taskType:        taskType || undefined,
        priority,
        status,
        startDate:       startDate || undefined,
        dueDate:         dueDate || undefined,
        siteLinks:       siteLinks.filter(Boolean),
        referenceLinks:  referenceLinks.filter(Boolean),
        notes:           notes.trim() || undefined,
      };
      const baseline = {
        description:     task?.description ?? undefined,
        taskType:        task?.taskType ?? undefined,
        priority:        task?.priority,
        status:          task?.status,
        startDate:       task?.startDate ?? undefined,
        dueDate:         task?.dueDate ?? undefined,
        siteLinks:       task?.siteLinks ?? [],
        referenceLinks:  task?.referenceLinks ?? [],
        notes:           task?.notes ?? undefined,
      };
      const payload = Object.fromEntries(
        Object.entries(next).filter(([key, value]) => {
          const prev = baseline[key as keyof typeof baseline];
          if (Array.isArray(value) && Array.isArray(prev)) {
            return JSON.stringify(value) !== JSON.stringify(prev);
          }
          return value !== prev;
        }),
      );
      return campaignApi.updateTask(projectId, taskId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
    },
  });

  /* ── Update assignees ───────────────────────────────────────────────── */
  const assigneeMutation = useMutation({
    mutationFn: (ids: string[]) =>
      campaignApi.updateAssignees(projectId, taskId!, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
    },
  });

  /* ── Upload attachments (batch) ─────────────────────────────────────── */
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => campaignApi.uploadAttachments(projectId, taskId!, files),
    onSuccess: (res) => {
      const { attachments, attachmentsCount } = res.data.data;
      queryClient.setQueryData(['seo-task', projectId, taskId], (prev: typeof task | undefined) =>
        prev ? { ...prev, attachments, attachmentsCount } : prev,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) =>
      campaignApi.deleteAttachment(projectId, taskId!, attachmentId),
    onSuccess: (res) => {
      const { attachments, attachmentsCount } = res.data.data;
      queryClient.setQueryData(['seo-task', projectId, taskId], (prev: typeof task | undefined) =>
        prev ? { ...prev, attachments, attachmentsCount } : prev,
      );
    },
  });

  /* ── Add comment ────────────────────────────────────────────────────── */
  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      campaignApi.addComment(projectId, taskId!, text),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['seo-task-comments', projectId, taskId] });
    },
  });

  /* ── Derived ────────────────────────────────────────────────────────── */
  const assigneeItems: ComboboxItem[] = (task?.assignees ?? []).map(a => ({
    id: a.id, label: a.name,
  }));

  /* ── Time tracking ──────────────────────────────────────────────────── */
  const timeLogsKey = ['seo-task-time-logs', projectId, taskId];
  const { data: timeLogs } = useQuery({
    queryKey: timeLogsKey,
    queryFn:  () => campaignApi.getTimeLogs(projectId, taskId!).then(r => r.data.data),
    enabled:  !!taskId && !!projectId,
  });

  const sessions: TimeSession[] = (timeLogs?.sessions ?? []).map(s => ({
    id:    String(s.id),
    date:  s.workDate,
    from:  s.startedAt,
    to:    s.endedAt,
    hours: s.durationHours,
  }));
  const totalHours     = timeLogs?.totalHours      ?? 0;
  const estimatedHours = timeLogs?.estimatedHours  ?? task?.estimatedHours ?? 0;
  const remainingHours = timeLogs?.remainingHours  ?? 0;
  const progress       = timeLogs?.progressPercent ?? 0;

  const timeLogMutation = useMutation({
    mutationFn: (payload: { workDate: string; startedAt: string; endedAt: string; notes: string }) =>
      campaignApi.addTimeLog(projectId, taskId!, {
        work_date:  payload.workDate,
        started_at: payload.startedAt,
        ended_at:   payload.endedAt,
        notes:      payload.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeLogsKey });
      toast.success(isAr ? 'تم تسجيل الوقت' : 'Time logged');
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تسجيل الوقت' : 'Failed to log time'));
    },
  });

  /* ── Combined save ──────────────────────────────────────────────────── */
  function handleSave() {
    saveMutation.mutate();
    const currentId = task?.assignees?.[0]?.id ?? '';
    if (assigneeId !== currentId) {
      assigneeMutation.mutate(assigneeId ? [assigneeId] : []);
    }
  }

  function handleAddComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    commentMutation.mutate(trimmed);
  }

  return {
    task, isLoading,
    tab, setTab,
    deleteOpen, setDeleteOpen,
    description,       setDescription,
    taskType,          setTaskType,
    priority,          setPriority,
    status,            setStatus,
    startDate,         setStartDate,
    dueDate,           setDueDate,
    assigneeId,        setAssigneeId,
    assigneeItems,
    targetUrl,         setTargetUrl,
    targetKeyword,     setTargetKeyword,
    searchIntent,      setSearchIntent,
    searchVolume,      setSearchVolume,
    keywordDifficulty, setKeywordDifficulty,
    metaTitle,         setMetaTitle,
    metaDescription,   setMetaDescription,
    siteLinks,         setSiteLinks,
    referenceLinks,    setReferenceLinks,
    notes,             setNotes,
    handleSave,
    isSaving: saveMutation.isPending || assigneeMutation.isPending,
    attachments: task?.attachments ?? [],
    attachmentsCount: task?.attachmentsCount ?? task?.attachments?.length ?? 0,
    uploadFiles: (files: File[]) => uploadMutation.mutate(files),
    deleteAttachment: (id: number) => deleteMutation.mutate(id),
    isUploading: uploadMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
    comments,
    commentText,
    setCommentText,
    addComment: handleAddComment,
    isAddingComment: commentMutation.isPending,
    sessions, totalHours, estimatedHours, remainingHours, progress,
    addTimeLog: (payload: { workDate: string; startedAt: string; endedAt: string; notes: string }) =>
      timeLogMutation.mutate(payload),
    loggingTime: timeLogMutation.isPending,
  };
}
