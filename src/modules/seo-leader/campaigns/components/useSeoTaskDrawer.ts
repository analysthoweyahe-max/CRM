import { useState, useEffect }                  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    mutationFn: () => campaignApi.updateTask(projectId, taskId!, {
      description:        description.trim()        || undefined,
      /* TODO: confirm real field name for updating a task's phase via this endpoint
         (was sending `task_type`, which doesn't exist in the confirmed create/list schema). */
      priority,
      status,
      start_date:         startDate                 || undefined,
      due_date:           dueDate                   || undefined,
      target_url:         targetUrl.trim()          || undefined,
      target_keyword:     targetKeyword.trim()      || undefined,
      search_intent:      searchIntent              || undefined,
      search_volume:      searchVolume       ? Number(searchVolume)       : undefined,
      keyword_difficulty: keywordDifficulty  ? Number(keywordDifficulty)  : undefined,
      meta_title:         metaTitle.trim()          || undefined,
      meta_description:   metaDescription.trim()    || undefined,
      site_links:         siteLinks.filter(Boolean),
      reference_links:    referenceLinks.filter(Boolean),
      notes:              notes.trim()              || undefined,
    }),
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

  /* ── Time: placeholder (no endpoint) ───────────────────────────────── */
  const sessions:        TimeSession[] = [];
  const totalHours     = 0;
  const estimatedHours = 0;
  const remainingHours = 0;
  const progress       = 0;

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
  };
}
