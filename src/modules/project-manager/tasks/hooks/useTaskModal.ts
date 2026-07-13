import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast }        from 'sonner';
import { getAvatarColor } from '@/shared/utils';
import { extractApiError } from '@/shared/utils/error.utils';
import { taskResourceKey } from '@/shared/utils/resourceKey.utils';
import { useRemoveTaskLocally, useInvalidateProjectTasks } from '../store/taskStore';
import { pmTaskApi } from '../api/task.api';
import type { RawPmComment, RawPmTaskAttachment } from '../api/task.api';
import type { Task } from '../types/task.types';
import type { TaskModalTab, TimeSession, TaskAttachment, TaskComment } from '../types/taskModal.types';

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function toAttachment(raw: RawPmTaskAttachment): TaskAttachment {
  const name = raw.name ?? raw.fileName ?? 'file';
  const ext  = name.split('.').pop()?.toLowerCase();
  const fileType: TaskAttachment['fileType'] =
    raw.mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext ?? '')
      ? 'image'
      : raw.mimeType === 'application/pdf' || ext === 'pdf'
      ? 'pdf'
      : 'other';
  return {
    id:         String(raw.id),
    name,
    sizeLabel:  formatSize(raw.size),
    uploadedBy: raw.uploadedBy?.name ?? '',
    uploadedAt: raw.uploadedAt ?? '',
    fileType,
    url:        raw.url,
  };
}

function toComment(raw: RawPmComment): TaskComment {
  return {
    id:            String(raw.id),
    author:        raw.sender.name,
    authorInitial: raw.sender.avatarInitial,
    authorColor:   getAvatarColor(raw.sender.name),
    text:          raw.body,
    dateLabel:     raw.sentAt,
  };
}

export function useTaskModal(task: Task | null, isAr: boolean, onClose: () => void, projectId: string) {
  const [activeTab, setActiveTab] = useState<TaskModalTab>('info');
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();
  const invalidateProjectTasks = useInvalidateProjectTasks(projectId);
  const removeTaskLocally      = useRemoveTaskLocally(projectId);
  const taskKey = task ? taskResourceKey(task) : '';

  const detailKey = ['pm-task-detail', projectId, taskKey];
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: detailKey,
    queryFn:  () => pmTaskApi.get(projectId, taskKey).then(r => r.data.data),
    enabled:  !!task && !!taskKey,
  });

  function invalidateDetail() {
    queryClient.invalidateQueries({ queryKey: detailKey });
  }

  /* ── Time tracking ── */
  const sessions: TimeSession[] = (detail?.tabs.timeTracking.sessions ?? []).map(s => ({
    id:    String(s.id),
    date:  s.workDate,
    from:  s.startedAt,
    to:    s.endedAt,
    hours: s.durationHours,
  }));
  const totalHours     = detail?.tabs.timeTracking.totalHours ?? 0;
  const estimatedHours = detail?.tabs.timeTracking.estimatedHours ?? (task?.estimatedHours ?? 0);
  const remainingHours = detail?.tabs.timeTracking.remainingHours ?? 0;
  const progress        = detail?.tabs.timeTracking.progressPercent ?? 0;

  const [loggingTime, setLoggingTime] = useState(false);
  async function addTimeLog(payload: { workDate: string; startedAt: string; endedAt: string; notes: string }) {
    if (!task || !taskKey || loggingTime) return;
    setLoggingTime(true);
    try {
      await pmTaskApi.addTimeLog(projectId, taskKey, {
        work_date:  payload.workDate,
        started_at: payload.startedAt,
        ended_at:   payload.endedAt,
        notes:      payload.notes || undefined,
      });
      invalidateDetail();
      toast.success(isAr ? 'تم تسجيل الوقت' : 'Time logged');
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تسجيل الوقت' : 'Failed to log time'));
    } finally {
      setLoggingTime(false);
    }
  }

  /* ── Comments ── */
  const commentsKey = ['pm-task-comments', projectId, taskKey];
  const { data: comments = [] } = useQuery({
    queryKey: commentsKey,
    queryFn:  () => pmTaskApi.getComments(projectId, taskKey).then(r => r.data.data.data.map(toComment)),
    enabled:  !!task && !!taskKey,
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => pmTaskApi.createComment(projectId, taskKey, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      invalidateDetail();
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذر إرسال التعليق' : 'Failed to send comment')),
  });

  function addComment() {
    const trimmed = commentText.trim();
    if (!trimmed || commentMutation.isPending) return;
    setCommentText('');
    commentMutation.mutate(trimmed);
  }

  /* ── Attachments ── */
  const attachments: TaskAttachment[] = (detail?.task.attachments ?? []).map(toAttachment);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => pmTaskApi.uploadAttachment(projectId, taskKey, file),
    onSuccess:  () => invalidateDetail(),
    onError:    (err) => toast.error(extractApiError(err) || (isAr ? 'تعذر رفع الملف' : 'Failed to upload file')),
  });

  function addAttachment(file: File) {
    if (!task || !taskKey) return;
    uploadMutation.mutate(file);
  }

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId: string) => pmTaskApi.deleteAttachment(projectId, taskKey, attachmentId),
    onSuccess:  () => invalidateDetail(),
    onError:    (err) => toast.error(extractApiError(err) || (isAr ? 'تعذر حذف الملف' : 'Failed to remove file')),
  });

  function removeAttachment(id: string) {
    removeAttachmentMutation.mutate(id);
  }

  function downloadAttachment(att: TaskAttachment) {
    if (att.url) {
      window.open(att.url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(isAr ? 'رابط الملف غير متاح' : 'File link not available');
    }
  }

  /* ── Edit modal ── */
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [editTitle,    setEditTitle]    = useState(task?.title ?? '');
  const [editPriority, setEditPriority] = useState<string>(task?.priority ?? '');
  const [editDueDate,  setEditDueDate]  = useState(task?.dueDate ?? '');
  const [editEstHours, setEditEstHours] = useState(String(task?.estimatedHours ?? 10));
  const [editEstMinutes, setEditEstMinutes] = useState(String(task?.estimatedMinutes ?? ''));
  const [savingEdit,   setSavingEdit]   = useState(false);

  function openEdit() {
    setEditTitle(task?.title ?? '');
    setEditPriority(task?.priority ?? '');
    setEditDueDate(task?.dueDate ?? '');
    setEditEstHours(String(task?.estimatedHours ?? 10));
    setEditEstMinutes(task?.estimatedMinutes != null ? String(task.estimatedMinutes) : '');
    setIsEditOpen(true);
  }
  function closeEdit() { setIsEditOpen(false); }

  async function saveEdit() {
    if (!task || !taskKey || !editTitle.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const next = {
        title:           editTitle.trim(),
        priority:        editPriority || undefined,
        dueDate:         editDueDate || undefined,
        estimatedHours:  editEstHours ? Number(editEstHours) : undefined,
        estimatedMinutes: editEstMinutes ? Number(editEstMinutes) : undefined,
      };
      const baseline = {
        title:           task.title,
        priority:        task.priority,
        dueDate:         task.dueDate || undefined,
        estimatedHours:  task.estimatedHours,
        estimatedMinutes: task.estimatedMinutes,
      };
      const payload = Object.fromEntries(
        Object.entries(next).filter(([key, value]) => value !== undefined && value !== baseline[key as keyof typeof baseline]),
      );
      if (Object.keys(payload).length === 0) {
        closeEdit();
        return;
      }
      await pmTaskApi.update(projectId, taskKey, payload);
      invalidateProjectTasks();
      invalidateDetail();
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
      closeEdit();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes'));
    } finally {
      setSavingEdit(false);
    }
  }

  /* ── Status change (Info tab) ── */
  const [changingStatus, setChangingStatus] = useState(false);
  async function changeStatus(status: string) {
    if (!task || !taskKey || status === task.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await pmTaskApi.updateStatus(projectId, taskKey, status);
      invalidateProjectTasks();
      invalidateDetail();
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
    } finally {
      setChangingStatus(false);
    }
  }

  /* ── Delete modal — no confirmed delete endpoint yet, so this only hides
     the task from the current view (resets on refetch). ── */
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  function openDelete()  { setIsDeleteOpen(true);  }
  function closeDelete() { setIsDeleteOpen(false); }
  function confirmDelete() {
    if (!task) return;
    removeTaskLocally(task.id);
    toast.success(isAr ? 'تم إخفاء المهمة' : 'Task hidden');
    setIsDeleteOpen(false);
    onClose();
  }

  return {
    activeTab, setActiveTab,
    detailLoading,
    sessions, totalHours, estimatedHours, remainingHours, progress,
    addTimeLog, loggingTime,
    attachments, removeAttachment, addAttachment, downloadAttachment,
    comments, commentText, setCommentText, addComment,
    isEditOpen, editTitle, setEditTitle,
    editPriority, setEditPriority,
    editDueDate, setEditDueDate, editEstHours, setEditEstHours,
    editEstMinutes, setEditEstMinutes,
    openEdit, closeEdit, saveEdit, savingEdit,
    changeStatus, changingStatus,
    isDeleteOpen, openDelete, closeDelete, confirmDelete,
  };
}
