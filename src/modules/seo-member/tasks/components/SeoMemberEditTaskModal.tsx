import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button }               from '@/shared/components/ui/Button';
import { Modal }                from '@/shared/components/ui/Modal';
import { FormField, inputCls }  from '@/shared/components/form/FormField';
import { Combobox }             from '@/shared/components/form/Combobox';
import { ImportantLinksField }  from '@/shared/components/form/ImportantLinksField';
import { useSeoTaskLookups }    from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import { normalizeImportantLinks, validateImportantLinks } from '@/shared/utils/importantLinks.utils';
import { useUpdateSeoTask }     from '../hooks/useSeoTaskDetail';
import type { SeoTaskDetail }   from '../types/seoTaskDetail.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  task:      SeoTaskDetail | undefined;
  projectId: string | undefined;
  taskId:    string | undefined;
  isAr:      boolean;
}

export function SeoMemberEditTaskModal({ open, onClose, task, projectId, taskId, isAr }: Props) {
  if (!open || !task) return null;

  return (
    <SeoMemberEditTaskModalForm
      onClose={onClose}
      task={task}
      projectId={projectId}
      taskId={taskId}
      isAr={isAr}
    />
  );
}

function SeoMemberEditTaskModalForm({
  onClose, task, projectId, taskId, isAr,
}: Omit<Props, 'open' | 'task'> & { task: SeoTaskDetail }) {
  const { priorityItems } = useSeoTaskLookups(isAr);
  const { mutate: updateTask, isPending } = useUpdateSeoTask(projectId, taskId, isAr);

  const [title,    setTitle]    = useState(task.title       ?? '');
  const [priority, setPriority] = useState<string>(
    task.priority === 'normal' ? 'medium' : (task.priority ?? 'medium'),
  );
  const [dueDate,  setDueDate]  = useState(task.dueDate      ?? '');
  const [importantLinks, setImportantLinks] = useState<string[]>(task.importantLinks ?? []);
  const [linksError, setLinksError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const err = validateImportantLinks(importantLinks, isAr);
    if (err) {
      setLinksError(err);
      return;
    }
    setLinksError(null);
    updateTask(
      {
        title: title.trim(),
        priority: priority === 'normal' ? 'medium' : priority,
        dueDate: dueDate || undefined,
        importantLinks: normalizeImportantLinks(importantLinks),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isAr ? 'تعديل المهمة' : 'Edit Task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!title.trim() || isPending} isLoading={isPending}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">

        <FormField label={isAr ? 'العنوان' : 'Title'} required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'الأولوية' : 'Priority'}>
          <Combobox
            items={priorityItems}
            value={priority}
            onChange={setPriority}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'تاريخ التسليم' : 'Due Date'}>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputCls(false)} pe-10`}
            />
            <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </FormField>

        <ImportantLinksField
          values={importantLinks}
          onChange={(v) => { setImportantLinks(v); setLinksError(null); }}
          isAr={isAr}
          error={linksError ?? undefined}
        />

      </div>
    </Modal>
  );
}
