import { useState, useEffect } from 'react';
import { toast }      from 'sonner';
import { Modal }       from '@/shared/components/ui/Modal';
import { Button }      from '@/shared/components/ui/Button';
import { Combobox }    from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { RichTextEditor } from '@/shared/components/form/RichTextEditor';
import type { PmProjectTeamMember, PmProjectPhase } from '../types/project.types';
import { pmTaskApi } from '../../tasks/api/task.api';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { usePmTaskLookups } from '../hooks/usePmTaskLookups';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

interface Props {
  open:      boolean;
  onClose:   () => void;
  projectId: string;
  team:      PmProjectTeamMember[];
  phases:    PmProjectPhase[];
  isAr:      boolean;
}

export function AddTaskModal({ open, onClose, projectId, team, phases, isAr }: Props) {
  const { statuses, priorities } = usePmTaskLookups();
  const invalidateTasks = useInvalidateProjectTasks(projectId);

  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState('');
  const [status,         setStatus]         = useState('');
  const [assigneeId,     setAssigneeId]     = useState('');
  const [dueDate,        setDueDate]        = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [phaseId,        setPhaseId]        = useState('');
  const [submitting,     setSubmitting]     = useState(false);

  useEffect(() => {
    if (!priority && priorities.length > 0) setPriority(priorities[0].value);
  }, [priorities, priority]);

  useEffect(() => {
    if (!status && statuses.length > 0) setStatus(statuses[0].value);
  }, [statuses, status]);

  const teamItems:     ComboboxItem[] = team.map(m => ({ id: m.id, label: m.name, detail: m.jobTitle }));
  const phaseItems:    ComboboxItem[] = phases.map(p => ({ id: String(p.id), label: p.name }));
  const priorityItems: ComboboxItem[] = priorities.map(p => ({ id: p.value, label: p.label }));
  const statusItems:   ComboboxItem[] = statuses.map(s => ({ id: s.value, label: s.label }));

  const isValid = !!(title.trim() && assigneeId && priority && status && dueDate && phaseId);

  function resetForm() {
    setTitle(''); setDescription(''); setPriority(''); setStatus('');
    setAssigneeId(''); setDueDate(''); setEstimatedHours(''); setPhaseId('');
  }

  async function handleAdd() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await pmTaskApi.create(projectId, {
        title:            title.trim(),
        description:      description.trim() || undefined,
        employee_id:      assigneeId,
        priority,
        due_date:         dueDate,
        estimated_hours:  estimatedHours ? Number(estimatedHours) : undefined,
        phase_id:         Number(phaseId),
        status,
      });

      invalidateTasks();
      toast.success(isAr ? 'تمت إضافة المهمة' : 'Task added');
      resetForm();
      onClose();
    } catch {
      toast.error(isAr ? 'فشل إضافة المهمة' : 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة مهمة' : 'Add Task'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!isValid || submitting} onClick={handleAdd}>
            {isAr ? 'إضافة مهمة' : 'Add Task'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className={LABEL}>
            {isAr ? 'عنوان المهمة' : 'Task Title'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان المهمة' : 'Task title'}
            className={INPUT}
          />
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={isAr ? 'وصف المهمة...' : 'Task description…'}
          />
        </div>

        {/* Assignee + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>
              {isAr ? 'المسؤول' : 'Assignee'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <Combobox
              items={teamItems}
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder={isAr ? 'اختر عضو' : 'Pick member'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
          <div>
            <label className={LABEL}>
              {isAr ? 'الأولوية' : 'Priority'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <Combobox
              items={priorityItems}
              value={priority}
              onChange={setPriority}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
        </div>

        {/* Due Date + Estimated Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>
              {isAr ? 'تاريخ التسليم' : 'Due Date'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>{isAr ? 'الساعات المقدرة' : 'Est. Hours'}</label>
            <input
              type="number"
              min="1"
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
              placeholder="8"
              className={INPUT}
            />
          </div>
        </div>

        {/* Stage + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>
              {isAr ? 'المرحلة' : 'Stage'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <Combobox
              items={phaseItems}
              value={phaseId}
              onChange={setPhaseId}
              placeholder={isAr ? 'اختر المرحلة' : 'Select stage'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
          <div>
            <label className={LABEL}>
              {isAr ? 'الحالة الابتدائية' : 'Initial Status'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <Combobox
              items={statusItems}
              value={status}
              onChange={setStatus}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
          </div>
        </div>

      </div>
    </Modal>
  );
}
