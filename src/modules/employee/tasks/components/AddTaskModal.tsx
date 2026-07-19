import { Calendar, Clock } from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { Combobox }            from '@/shared/components/form/Combobox';
import { RichTextEditor }      from '@/shared/components/form/RichTextEditor';
import { ImportantLinksField } from '@/shared/components/form/ImportantLinksField';
import { useAddTaskModal }     from './useAddTaskModal';
import type { AddTaskModalProps } from './AddTaskModal.types';

export function AddTaskModal({ open, onClose, isAr }: AddTaskModalProps) {
  const {
    projectId, setProjectId, projectItems,
    phaseId, setPhaseId, phaseItems,
    title, setTitle,
    description, setDescription,
    priority, setPriority, priorityItems,
    dueDate, setDueDate,
    estimatedHours, setEstimatedHours,
    importantLinks, setImportantLinks,
    errors, creating,
    handleSubmit, handleClose,
  } = useAddTaskModal(onClose, isAr);

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
          <Button variant="primary" onClick={handleSubmit} disabled={creating} isLoading={creating}>
            {isAr ? 'إضافة' : 'Add'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">

        <FormField label={isAr ? 'المشروع' : 'Project'} required error={errors.projectId}>
          <Combobox
            items={projectItems}
            value={projectId}
            onChange={v => { setProjectId(v); setPhaseId(''); }}
            error={!!errors.projectId}
            placeholder={isAr ? 'اختر المشروع' : 'Select project'}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد مشاريع' : 'No projects'}
          />
        </FormField>

        <FormField label={isAr ? 'العنوان' : 'Title'} required error={errors.title}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
            className={inputCls(!!errors.title)}
          />
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'}>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={isAr ? 'وصف المهمة (اختياري)' : 'Task description (optional)'}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'الأولوية' : 'Priority'}>
            <Combobox
              items={priorityItems}
              value={priority}
              onChange={v => setPriority(v as typeof priority)}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </FormField>
          <FormField label={isAr ? 'المرحلة' : 'Phase'}>
            <Combobox
              items={phaseItems}
              value={phaseId}
              onChange={setPhaseId}
              disabled={!projectId || phaseItems.length === 0}
              placeholder={isAr ? 'اختياري' : 'Optional'}
              searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
              noResultsText={isAr ? 'لا توجد مراحل' : 'No phases'}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={isAr ? 'تاريخ التسليم' : 'Due Date'}>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`${inputCls(false)} pe-10`}
              />
              <Calendar size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label={isAr ? 'الساعات المقدرة' : 'Estimated Hours'}>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                placeholder="0"
                className={`${inputCls(false)} pe-10`}
              />
              <Clock size={15} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FormField>
        </div>

        <ImportantLinksField
          values={importantLinks}
          onChange={setImportantLinks}
          isAr={isAr}
          error={errors.importantLinks}
        />

      </div>
    </Modal>
  );
}
