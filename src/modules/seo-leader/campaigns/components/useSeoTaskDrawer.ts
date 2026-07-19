import { useState, useEffect }                  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }                                 from 'sonner';
import { extractApiError, extractEditApiError, extractApiStatus } from '@/shared/utils/error.utils';
import {
  excludeSelfFromActors,
  filterSeoProjectMentions,
  isSameActorId,
  normalizeTaskCommentFields,
} from '@/shared/utils/chatNormalize.utils';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { campaignApi }                           from '../api/campaign.api';
import type { Mentionable, SeoComment }          from '../api/campaign.api'; // used in extractComments + toTaskComment
import type { SeoDrawerTab }                     from './SeoTaskModal.types';
import type { ComboboxItem }                     from '@/shared/components/form/Combobox';
import type { TaskComment, TimeSession }         from '@/modules/project-manager/tasks/types/taskModal.types';
import type { ExtendDeadlinePayload }            from '@/shared/components/form/ExtendDeadlineModal';
import type { MentionRef }                       from '@/shared/components/chat';
import { useAuth } from '@/modules/auth/context/AuthContext';

function toMentionRefs(raw: unknown[] | undefined): MentionRef[] | undefined {
  const refs = (raw ?? [])
    .filter((m): m is { type: unknown; id: unknown } => !!m && typeof m === 'object')
    .filter(m => typeof m.type === 'string' && (typeof m.id === 'string' || typeof m.id === 'number'))
    .map(m => ({ type: m.type as string, id: String(m.id) }));
  return refs.length ? refs : undefined;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['bg-violet-500','bg-sky-500','bg-amber-500','bg-rose-500','bg-teal-500','bg-indigo-500'];
function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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

function toTaskComment(
  c: SeoComment,
  user?: { id?: string | null; employeeId?: string | null } | null,
): TaskComment {
  const name = c.sender?.name ?? 'مجهول';
  const edit = normalizeTaskCommentFields(c);
  return {
    id:            String(c.id),
    author:        name,
    authorInitial: name[0]?.toUpperCase() ?? '?',
    authorColor:   colorFor(name),
    text:          c.body,
    dateLabel:     c.sentAt ?? '',
    isMine:        isSameActorId(c.sender?.id, user),
    mentions:      edit.mentions ?? toMentionRefs(c.mentions),
    isEdited:      edit.isEdited,
    editedAt:      edit.editedAt,
    replies:       (c.replies ?? []).map(r => toTaskComment(r, user)),
  };
}

/* ── Hook ────────────────────────────────────────────────────────────── */
export function useSeoTaskDrawer(
  projectId: string,
  taskId:    string | null,
  isAr:      boolean,
  options?: { initialTab?: SeoDrawerTab },
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /* ── Tab ───────────────────────────────────────────────────────────── */
  const [tab,        setTab]        = useState<SeoDrawerTab>(options?.initialTab ?? 'info');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);

  useEffect(() => {
    if (options?.initialTab) setTab(options.initialTab);
  }, [options?.initialTab, taskId]);

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

  const comments: TaskComment[] = extractComments(rawComments).map(c => toTaskComment(c, user));

  /* ── Mentionables (picker excludes self; used for @mentions in comments) ─── */
  const { data: mentionablesRaw } = useQuery({
    queryKey: ['seo-mentionables', projectId],
    queryFn:  () => campaignApi.getMentionables(projectId)
      .then(r => filterSeoProjectMentions(
        excludeSelfFromActors(toApiArray<Mentionable>(r.data.data), user),
      )),
    enabled:  !!projectId,
    staleTime: 60_000,
  });
  const mentionables = mentionablesRaw ?? [];

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

  /* ── Update status ─────────────────────────────────────────────────────
     Fires immediately on select, independent of the bundled saveMutation
     below (which the drawer's "Update Task" button no longer even goes
     through — it opens SeoEditTaskModal instead). Uses the general
     task-update endpoint with `status` in the body rather than the
     dedicated PATCH .../status sub-route, matching the Kanban drag
     handler: that route is manager-guarded to employee tokens only per
     the backend's own Postman collection. */
  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => campaignApi.updateTask(projectId, taskId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
    },
  });

  function changeStatus(newStatus: string) {
    setStatus(newStatus);
    statusMutation.mutate(newStatus);
  }

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
    mutationFn: ({ text, parentId, mentions }: { text: string; parentId?: string; mentions?: Array<{ type: string; id: string }> }) =>
      campaignApi.addComment(projectId, taskId!, text, { parentId, mentions }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['seo-task-comments', projectId, taskId] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, body, mentions }: { id: string; body: string; mentions?: Array<{ type: string; id: string }> }) =>
      campaignApi.updateComment(projectId, taskId!, id, { body, mentions }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['seo-task-comments', projectId, taskId] });
    },
    onError: (err) => {
      if (extractApiStatus(err) === 404) {
        queryClient.invalidateQueries({ queryKey: ['seo-task-comments', projectId, taskId] });
      }
      toast.error(extractEditApiError(err, { isAr, kind: 'comment' }));
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

  /* ── Extend deadline ────────────────────────────────────────────────── */
  const extendMutation = useMutation({
    mutationFn: (payload: ExtendDeadlinePayload) =>
      campaignApi.extendTaskDeadline(projectId, taskId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
      toast.success(isAr ? 'تم تمديد الموعد النهائي' : 'Deadline extended');
      setExtendOpen(false);
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تمديد الموعد' : 'Failed to extend deadline'));
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

  function handleAddComment(parentId?: string, mentions?: Array<{ type: string; id: string }>) {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    commentMutation.mutate({ text: trimmed, parentId, mentions });
  }

  function handleUpdateComment(id: string, body: string, mentions?: Array<{ type: string; id: string }>) {
    const trimmed = body.trim();
    if (!trimmed) return;
    updateCommentMutation.mutate({ id, body: trimmed, mentions });
  }

  return {
    task, isLoading,
    tab, setTab,
    deleteOpen, setDeleteOpen,
    extendOpen, setExtendOpen,
    extendDeadline: (payload: ExtendDeadlinePayload) => extendMutation.mutate(payload),
    extendingDeadline: extendMutation.isPending,
    description,       setDescription,
    taskType,          setTaskType,
    priority,          setPriority,
    status,            setStatus: changeStatus,
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
    mentionables,
    commentText,
    setCommentText,
    addComment: handleAddComment,
    updateComment: handleUpdateComment,
    isAddingComment: commentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    sessions, totalHours, estimatedHours, remainingHours, progress,
    addTimeLog: (payload: { workDate: string; startedAt: string; endedAt: string; notes: string }) =>
      timeLogMutation.mutate(payload),
    loggingTime: timeLogMutation.isPending,
  };
}
