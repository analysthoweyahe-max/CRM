import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { RichTextEditor } from '@/shared/components/form/RichTextEditor';
import { ImportantLinksField } from '@/shared/components/form/ImportantLinksField';
import { normalizeImportantLinks, validateImportantLinks } from '@/shared/utils/importantLinks.utils';
import { useUpdateTask } from '../hooks/useTaskDetail';
import type { TaskDetail } from '../types/taskDetail.types';
import type { EmpTaskPriority } from '../types/employeeTask.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  task:      TaskDetail;
  isAr:      boolean;
}

interface FormValues {
  title:          string;
  description:    string;
  priority:       EmpTaskPriority;
  deadline:       string;
  allocatedHours: string;
}

function formDefaults(task: TaskDetail): FormValues {
  return {
    title:          task.title,
    description:    task.description,
    priority:       task.priority,
    deadline:       task.deadline.slice(0, 10),
    allocatedHours: String(task.allocatedHours || ''),
  };
}

export function EditTaskModal({ open, onClose, task, isAr }: Props) {
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: formDefaults(task),
  });
  const [importantLinks, setImportantLinks] = useState<string[]>(task.importantLinks ?? []);
  const [linksError, setLinksError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      reset(formDefaults(task));
      setImportantLinks(task.importantLinks ?? []);
      setLinksError(null);
    }
  }, [open, task, reset]);

  const mutation = useUpdateTask(task.projectId, task.id);

  const priorityItems = [
    { id: 'low',    label: isAr ? 'منخفضة' : 'Low'    },
    { id: 'medium', label: isAr ? 'متوسطة' : 'Medium' },
    { id: 'high',   label: isAr ? 'عالية'  : 'High'   },
  ];

  function onSubmit(data: FormValues) {
    const err = validateImportantLinks(importantLinks, isAr);
    if (err) {
      setLinksError(err);
      return;
    }
    setLinksError(null);
    mutation.mutate({
      title:          data.title.trim(),
      description:    data.description.trim(),
      priority:       data.priority,
      deadline:       data.deadline,
      allocatedHours: Number(data.allocatedHours) || 0,
      importantLinks: normalizeImportantLinks(importantLinks),
    }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
        onClose();
      },
      onError: () => toast.error(isAr ? 'تعذّر حفظ التعديلات' : 'Failed to save changes'),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل المهمة' : 'Edit Task'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button isLoading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label={isAr ? 'العنوان' : 'Title'}>
          <Input {...register('title')} placeholder={isAr ? 'عنوان المهمة' : 'Task title'} />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                dir={isAr ? 'rtl' : 'ltr'}
                placeholder={isAr ? 'وصف المهمة...' : 'Task description...'}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={isAr ? 'الأولوية' : 'Priority'}>
            <Controller name="priority" control={control} render={({ field }) => (
              <Combobox items={priorityItems} value={field.value} onChange={field.onChange}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'} />
            )} />
          </FormField>

          <FormField label={isAr ? 'تاريخ التسليم' : 'Due Date'}>
            <Input {...register('deadline')} type="date" />
          </FormField>
        </div>

        <FormField label={isAr ? 'الساعات المقدرة' : 'Estimated Hours'}>
          <Input {...register('allocatedHours')} type="number" min={0} placeholder="0" />
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
