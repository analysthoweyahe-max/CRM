import { AlertTriangle, X }    from 'lucide-react';
import { useTaskModal }          from '../hooks/useTaskModal';
import { TaskInfoTab }           from './TaskInfoTab';
import { TaskTimeTab }           from './TaskTimeTab';
import { TaskAttachmentsTab }    from './TaskAttachmentsTab';
import { TaskCommentsTab }       from './TaskCommentsTab';
import { Modal }                 from '@/shared/components/ui/Modal';
import { Button }                from '@/shared/components/ui/Button';
import { inputCls }              from '@/shared/components/form/FormField';
import type { Task }             from '../types/task.types';
import type { TaskModalTab }     from '../types/taskModal.types';

interface TabDef { key: TaskModalTab; ar: string; en: string; countProp?: 'attachments' | 'comments' }

const TABS: TabDef[] = [
  { key: 'info',        ar: 'المعلومات',  en: 'Info'        },
  { key: 'time',        ar: 'تتبع الوقت', en: 'Time'        },
  { key: 'attachments', ar: 'المرفقات',   en: 'Attachments', countProp: 'attachments' },
  { key: 'comments',    ar: 'التعليقات',  en: 'Comments',    countProp: 'comments'    },
];

interface Props {
  task:    Task | null;
  onClose: () => void;
  isAr:    boolean;
}

export function TaskModal({ task, onClose, isAr }: Props) {
  const modal = useTaskModal(task, isAr, onClose);

  if (!task) return null;

  const counts = { attachments: modal.attachments.length, comments: modal.comments.length };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-right">
            {task.taskNumber} · {task.title}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-end border-b border-gray-100 dark:border-gray-700 shrink-0 overflow-x-auto px-4">
          {TABS.map(t => {
            const count    = t.countProp ? counts[t.countProp] : undefined;
            const isActive = modal.activeTab === t.key;
            return (
              <button key={t.key} type="button" onClick={() => modal.setActiveTab(t.key)}
                className={[
                  'flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39] font-semibold'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                {isAr ? t.ar : t.en}
                {count !== undefined && (
                  <span className={[
                    'text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center',
                    isActive ? 'bg-[#A0CD39] text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500',
                  ].join(' ')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {modal.activeTab === 'info' && (
            <TaskInfoTab
              task={task}
              onDeleteClick={modal.openDelete}
              onEditClick={modal.openEdit}
              isAr={isAr}
            />
          )}
          {modal.activeTab === 'time' && (
            <TaskTimeTab
              sessions={modal.sessions}
              totalHours={modal.totalHours}
              estimatedHours={modal.estimatedHours}
              remainingHours={modal.remainingHours}
              progress={modal.progress}
              isAr={isAr}
            />
          )}
          {modal.activeTab === 'attachments' && (
            <TaskAttachmentsTab
              attachments={modal.attachments}
              onRemove={modal.removeAttachment}
              onAdd={modal.addAttachment}
              onDownload={modal.downloadAttachment}
              isAr={isAr}
            />
          )}
          {modal.activeTab === 'comments' && (
            <TaskCommentsTab
              comments={modal.comments}
              text={modal.commentText}
              setText={modal.setCommentText}
              onSubmit={modal.addComment}
              isAr={isAr}
            />
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal
        open={modal.isEditOpen}
        onClose={modal.closeEdit}
        title={isAr ? 'تعديل المهمة' : 'Edit Task'}
        size="md"
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button variant="primary" onClick={modal.saveEdit}>
              {isAr ? 'حفظ' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={modal.closeEdit}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 justify-end">
              <span className="text-red-500">*</span>
              {isAr ? 'العنوان' : 'Title'}
            </label>
            <input
              type="text"
              value={modal.editTitle}
              onChange={e => modal.setEditTitle(e.target.value)}
              className={`${inputCls(false)} text-right`}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
              {isAr ? 'الوصف' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={modal.editDesc}
              onChange={e => modal.setEditDesc(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 outline-none resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 text-right placeholder:text-gray-400"
              placeholder={isAr ? 'وصف تفصيلي للمهمة...' : 'Task description...'}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                {isAr ? 'تاريخ التسليم' : 'Due Date'}
              </label>
              <input
                type="date"
                value={modal.editDueDate}
                onChange={e => modal.setEditDueDate(e.target.value)}
                className={`${inputCls(false)} text-right`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                {isAr ? 'تاريخ البداية' : 'Start Date'}
              </label>
              <input
                type="date"
                defaultValue="2026-06-10"
                className={`${inputCls(false)} text-right`}
              />
            </div>
          </div>

          {/* Estimated hours */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
              {isAr ? 'الساعات المقدّرة' : 'Estimated Hours'}
            </label>
            <input
              type="number"
              min={1}
              value={modal.editEstHours}
              onChange={e => modal.setEditEstHours(e.target.value)}
              className={`${inputCls(false)} text-right`}
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={modal.isDeleteOpen}
        onClose={modal.closeDelete}
        title={isAr ? 'حذف المهمة' : 'Delete Task'}
        size="sm"
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button variant="danger" onClick={modal.confirmDelete}>
              {isAr ? 'حذف' : 'Delete'}
            </Button>
            <Button variant="ghost" onClick={modal.closeDelete}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-end gap-4 text-end">
          <div className="self-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isAr
              ? <>هل أنت متأكد من حذف <span className="font-semibold text-gray-900 dark:text-gray-100">"{task.title}"</span>؟</>
              : <>Are you sure you want to delete <span className="font-semibold">"{task.title}"</span>?</>
            }
          </p>
          <div className="w-full rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2.5 text-center">
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
