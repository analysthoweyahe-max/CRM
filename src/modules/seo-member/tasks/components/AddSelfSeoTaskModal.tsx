import { Calendar, Clock } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }            from '@/shared/components/form/Combobox';
import { useAddSelfSeoTask }   from './useAddSelfSeoTask';

interface Props {
  open:    boolean;
  onClose: () => void;
  isAr:    boolean;
}

export function AddSelfSeoTaskModal({ open, onClose, isAr }: Props) {
  const {
    projectId, setProjectId, projectItems,
    title, setTitle,
    phase, setPhase,
    description, setDescription,
    priority, setPriority, priorityItems,
    dueDate, setDueDate,
    estimatedHours, setEstimatedHours,
    isValid, creating,
    handleSubmit, handleClose,
  } = useAddSelfSeoTask(onClose, isAr);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'إضافة مهمة شخصية' : 'Add Personal Task'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid} isLoading={creating}>
            {isAr ? 'إضافة' : 'Add'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">

        <FormField label={isAr ? 'المشروع' : 'Project'} required>
          <Combobox
            items={projectItems}
            value={projectId}
            onChange={setProjectId}
            placeholder={isAr ? 'اختر المشروع' : 'Select project'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد مشاريع' : 'No projects'}
          />
        </FormField>

        <FormField label={isAr ? 'العنوان' : 'Title'} required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'المرحلة' : 'Phase'} required>
          <input
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            placeholder={isAr ? 'مثال: On-Page SEO' : 'e.g. On-Page SEO'}
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={isAr ? 'وصف المهمة (اختياري)' : 'Task description (optional)'}
            className={`${inputCls(false)} h-auto! py-3 resize-none`}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'الأولوية' : 'Priority'}>
            <Combobox
              items={priorityItems}
              value={priority}
              onChange={(v) => setPriority(v as typeof priority)}
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
        </div>

        <FormField label={isAr ? 'الساعات المقدرة' : 'Estimated Hours'}>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="0"
              className={`${inputCls(false)} pe-10`}
            />
            <Clock size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </FormField>

      </div>
    </Modal>
  );
}
