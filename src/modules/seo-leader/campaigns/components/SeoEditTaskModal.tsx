import { useState, useEffect }          from 'react';
import { useMutation, useQueryClient }  from '@tanstack/react-query';
import { X }                            from 'lucide-react';
import { Button }                       from '@/shared/components/ui/Button';
import { Combobox }                     from '@/shared/components/form/Combobox';
import { ImportantLinksField }          from '@/shared/components/form/ImportantLinksField';
import { campaignApi }                  from '../api/campaign.api';
import { useSeoTaskLookups }            from '../hooks/useSeoTaskLookups';
import type { SeoTaskFull }             from './SeoTaskModal.types';
import { taskResourceKey }              from '@/shared/utils/resourceKey.utils';
import { extractApiError }              from '@/shared/utils/error.utils';
import { normalizeImportantLinks, validateImportantLinks } from '@/shared/utils/importantLinks.utils';
import { invalidateAfterSeoTaskUpdate } from '@/shared/modules/my-tasks/utils/invalidateHomeTasks.utils';
import { toast }                        from 'sonner';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-end';

interface Props {
  task:      SeoTaskFull;
  projectId: string;
  isAr:      boolean;
  onClose:   () => void;
}

export function SeoEditTaskModal({ task, projectId, isAr, onClose }: Props) {
  const queryClient = useQueryClient();
  const { priorityItems } = useSeoTaskLookups(isAr);

  const [title,    setTitle]    = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate,  setDueDate]  = useState('');
  const [importantLinks, setImportantLinks] = useState<string[]>([]);
  const [linksError, setLinksError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(task.title       ?? '');
    setPriority(task.priority ?? 'medium');
    setDueDate(task.dueDate   ?? '');
    setImportantLinks(task.importantLinks ?? []);
    setLinksError(null);
  }, [task]);

  const taskKey = taskResourceKey(task);

  const mutation = useMutation({
    mutationFn: () => {
      const links = normalizeImportantLinks(importantLinks);
      return campaignApi.updateTask(projectId, taskKey, {
        title:    title.trim() || undefined,
        priority: priority     || undefined,
        dueDate:  dueDate      || undefined,
        importantLinks: links,
      });
    },
    onSuccess: () => {
      invalidateAfterSeoTaskUpdate(queryClient, projectId, taskKey);
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
      onClose();
    },
    onError: (err) => {
      toast.error(extractApiError(err) || (isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes'));
    },
  });

  function handleSave() {
    const err = validateImportantLinks(importantLinks, isAr);
    if (err) {
      setLinksError(err);
      return;
    }
    setLinksError(null);
    mutation.mutate();
  }

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/40 dark:bg-black/60" onClick={onClose} />

      <div className="fixed inset-0 z-70 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'تعديل المهمة' : 'Edit Task'}
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Title */}
            <div>
              <label className={LABEL}>
                {isAr ? 'العنوان' : 'Title'}
                <span className="text-red-500 ms-1">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={INPUT}
                placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
              />
            </div>

            {/* Priority */}
            <div>
              <label className={LABEL}>{isAr ? 'الأولوية' : 'Priority'}</label>
              <Combobox
                items={priorityItems}
                value={priority}
                onChange={setPriority}
                placeholder={isAr ? 'اختر الأولوية' : 'Select priority'}
              />
            </div>

            {/* Due date */}
            <div>
              <label className={LABEL}>{isAr ? 'تاريخ التسليم' : 'Due Date'}</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={INPUT}
              />
            </div>

            <ImportantLinksField
              values={importantLinks}
              onChange={(v) => { setImportantLinks(v); setLinksError(null); }}
              isAr={isAr}
              error={linksError ?? undefined}
            />

          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300
                         hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <Button
              variant="primary"
              disabled={!title.trim() || mutation.isPending}
              onClick={handleSave}
            >
              {mutation.isPending
                ? (isAr ? 'جاري الحفظ...' : 'Saving…')
                : (isAr ? 'حفظ' : 'Save')}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
