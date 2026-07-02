import { useState, useMemo } from 'react';
import { toast }        from 'sonner';
import { deleteTask, moveTask, updateTask } from '../store/taskStore';
import { pmTaskApi }    from '../api/task.api';
import type { Task, TaskPriority, TaskStatus } from '../types/task.types';
import type { TaskModalTab, TimeSession, TaskAttachment, TaskComment } from '../types/taskModal.types';

const MOCK_SESSIONS: TimeSession[] = [
  { id: '1', date: '18 يونيو', from: '09:00', to: '11:30', hours: 2.5  },
  { id: '2', date: '18 يونيو', from: '13:00', to: '15:45', hours: 2.75 },
  { id: '3', date: '19 يونيو', from: '09:00', to: '10:15', hours: 1.25 },
];

const MOCK_ATTACHMENTS: TaskAttachment[] = [
  { id: 'a1', name: 'mockup.png', sizeLabel: '240 KB', uploadedBy: 'سارة خليل',    uploadedAt: '17 يونيو 2026', fileType: 'image' },
  { id: 'a2', name: 'spec.pdf',   sizeLabel: '1.2 MB', uploadedBy: 'أحمد المنصور', uploadedAt: '16 يونيو 2026', fileType: 'pdf'   },
];

const MOCK_COMMENTS: TaskComment[] = [
  { id: 'c1', author: 'أحمد المنصور', authorInitial: 'أ', authorColor: 'bg-orange-500',
    text: 'تأكد من مطابقة التصميم لنظام الألوان @محمد علي', dateLabel: '18 يونيو 10:20' },
  { id: 'c2', author: 'محمد علي', authorInitial: 'م', authorColor: 'bg-blue-500',
    text: 'تم، سأرفع النسخة المحدثة قريباً.', dateLabel: '18 يونيو 11:05' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function useTaskModal(task: Task | null, isAr: boolean, onClose: () => void, projectId: string) {
  const [activeTab,    setActiveTab]    = useState<TaskModalTab>('info');
  const [attachments,  setAttachments]  = useState<TaskAttachment[]>(MOCK_ATTACHMENTS);
  const [comments,     setComments]     = useState<TaskComment[]>(MOCK_COMMENTS);
  const [commentText,  setCommentText]  = useState('');

  // Edit modal
  const [isEditOpen,    setIsEditOpen]    = useState(false);
  const [editTitle,     setEditTitle]     = useState(task?.title ?? '');
  const [editPriority,  setEditPriority]  = useState<string>(task?.priority ?? '');
  const [editDueDate,   setEditDueDate]   = useState(task?.dueDate ?? '');
  const [editEstHours,  setEditEstHours]  = useState(String(task?.estimatedHours ?? 10));
  const [savingEdit,    setSavingEdit]    = useState(false);

  // Status change (Info tab)
  const [changingStatus, setChangingStatus] = useState(false);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Time tracking
  const totalHours     = useMemo(() => MOCK_SESSIONS.reduce((s, ss) => s + ss.hours, 0), []);
  const estimatedHours = task?.estimatedHours ?? 10;
  const remainingHours = Math.max(0, estimatedHours - totalHours);
  const progress       = Math.min(100, Math.round((totalHours / estimatedHours) * 100));

  /* ── Comments ── */
  function addComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const now = new Date();
    setComments(prev => [...prev, {
      id: String(now.getTime()),
      author: 'أحمد المنصور', authorInitial: 'أ', authorColor: 'bg-orange-500',
      text: trimmed,
      dateLabel: `${now.getDate()} يونيو ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
    }]);
    setCommentText('');
  }

  /* ── Attachments ── */
  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  function addAttachment(file: File) {
    const fileType: TaskAttachment['fileType'] = file.type.startsWith('image/') ? 'image'
      : file.type === 'application/pdf' ? 'pdf' : 'other';
    setAttachments(prev => [...prev, {
      id: String(Date.now()),
      name: file.name,
      sizeLabel: formatSize(file.size),
      uploadedBy: 'أحمد المنصور',
      uploadedAt: `${new Date().getDate()} يونيو 2026`,
      fileType,
      file,
    }]);
  }

  function downloadAttachment(att: TaskAttachment) {
    if (att.file) {
      const url = URL.createObjectURL(att.file);
      const a = Object.assign(document.createElement('a'), { href: url, download: att.name });
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.info(isAr ? 'الملف التجريبي غير متاح للتنزيل' : 'Demo file not available');
    }
  }

  /* ── Edit modal ── */
  function openEdit()  { setIsEditOpen(true);  }
  function closeEdit() { setIsEditOpen(false); }
  async function saveEdit() {
    if (!task || !editTitle.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await pmTaskApi.update(projectId, task.id, {
        title:            editTitle.trim(),
        priority:         editPriority,
        due_date:         editDueDate,
        estimated_hours:  editEstHours ? Number(editEstHours) : undefined,
      });
      updateTask(task.id, {
        title:          editTitle.trim(),
        priority:       editPriority as TaskPriority,
        dueDate:        editDueDate,
        estimatedHours: editEstHours ? Number(editEstHours) : undefined,
      });
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
      closeEdit();
    } catch {
      toast.error(isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  }

  /* ── Status change (Info tab) ── */
  async function changeStatus(status: string) {
    if (!task || status === task.status || changingStatus) return;
    setChangingStatus(true);
    try {
      await pmTaskApi.updateStatus(projectId, task.id, status);
      moveTask(task.id, status as TaskStatus);
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch {
      toast.error(isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status');
    } finally {
      setChangingStatus(false);
    }
  }

  /* ── Delete modal ── */
  function openDelete()  { setIsDeleteOpen(true);  }
  function closeDelete() { setIsDeleteOpen(false); }
  function confirmDelete() {
    if (!task) return;
    deleteTask(task.id);
    toast.success(isAr ? 'تم حذف المهمة' : 'Task deleted');
    setIsDeleteOpen(false);
    onClose();
  }

  return {
    activeTab, setActiveTab,
    sessions: MOCK_SESSIONS, totalHours, estimatedHours, remainingHours, progress,
    attachments, removeAttachment, addAttachment, downloadAttachment,
    comments, commentText, setCommentText, addComment,
    isEditOpen, editTitle, setEditTitle,
    editPriority, setEditPriority,
    editDueDate, setEditDueDate, editEstHours, setEditEstHours,
    openEdit, closeEdit, saveEdit, savingEdit,
    changeStatus, changingStatus,
    isDeleteOpen, openDelete, closeDelete, confirmDelete,
  };
}
