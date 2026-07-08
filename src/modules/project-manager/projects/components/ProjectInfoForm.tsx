import { useState, useEffect } from 'react';
import { Check }    from 'lucide-react';
import { toast }    from 'sonner';
import { Button }   from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useProjectSettings }      from '../hooks/useProjectSettings';
import { usePmProjectLookups }     from '../hooks/usePmProjectLookups';
import type { PmLookupItem } from '../types/project.types';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

function toComboboxItems(lookups: PmLookupItem[], isAr: boolean): ComboboxItem[] {
  return lookups.map(l => ({
    id:    l.value,
    label: translateProjectLookup(l.value, l.label, isAr),
  }));
}

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectInfoForm({ projectId, isAr }: Props) {
  const { settings, isLoading, save } = useProjectSettings(projectId);
  const { statuses, types }           = usePmProjectLookups();

  const [name,        setName]        = useState('');
  const [description, setDesc]        = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [deadline,    setDeadline]    = useState('');
  const [status,      setStatus]      = useState('');
  const [projectType, setType]        = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setDesc(settings.description ?? '');
    setStartDate(settings.startDate ?? '');
    setDeadline(settings.deadline ?? '');
    setStatus(settings.status);
    setType(settings.projectType);
  }, [settings]);

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await save({
        name:            name.trim(),
        description:     description.trim(),
        project_type_id: Number(projectType),
        status,
        is_draft:        settings?.isDraft ?? false,
        start_date:      startDate,
        deadline,
      });
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
    } catch {
      toast.error(isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse h-32 rounded-xl bg-gray-100 dark:bg-gray-700/60" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'معلومات المشروع' : 'Project Information'}
      </h2>

      {/* Name + Start Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'اسم المشروع' : 'Project Name'}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder={isAr ? 'وصف المشروع وأهدافه...' : 'Project description and goals…'}
          className={`${INPUT} resize-none`}
        />
      </div>

      {/* Status + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'الحالة' : 'Status'}</label>
          <Combobox
            items={toComboboxItems(statuses, isAr)}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'النوع' : 'Type'}</label>
          <Combobox
            items={toComboboxItems(types, isAr)}
            value={projectType}
            onChange={setType}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className={LABEL}>{isAr ? 'الموعد النهائي' : 'Deadline'}</label>
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className={INPUT}
        />
      </div>

      <Button
        variant="primary"
        startIcon={<Check size={15} />}
        disabled={!name.trim() || saving}
        onClick={handleSave}
      >
        {isAr ? 'حفظ' : 'Save'}
      </Button>
    </div>
  );
}
