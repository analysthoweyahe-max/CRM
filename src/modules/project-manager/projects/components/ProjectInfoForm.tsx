import { useState } from 'react';
import { Check }    from 'lucide-react';
import { Button }   from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { Project, ProjectStatus } from '../types/project.types';
import { updateProject } from '../store/projectStore';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const STATUS_ITEMS: ComboboxItem[] = [
  { id: 'notStarted', label: 'لم يبدأ'     },
  { id: 'inProgress', label: 'قيد التنفيذ' },
  { id: 'paused',     label: 'متوقف'       },
  { id: 'completed',  label: 'مكتمل'       },
];

const TYPE_ITEMS: ComboboxItem[] = [
  { id: 'موقع إلكتروني', label: 'موقع إلكتروني' },
  { id: 'تطبيق موبايل',  label: 'تطبيق موبايل'  },
  { id: 'نظام إدارة',    label: 'نظام إدارة'     },
  { id: 'لوحة تحكم',    label: 'لوحة تحكم'      },
  { id: 'تطبيق ويب',    label: 'تطبيق ويب'      },
  { id: 'أخرى',          label: 'أخرى'           },
];

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProjectInfoForm({ project, isAr }: Props) {
  const [name,      setName]      = useState(project.nameAr);
  const [startDate, setStartDate] = useState(project.startDate ?? '');
  const [desc,      setDesc]      = useState(project.description ?? '');
  const [status,    setStatus]    = useState<string>(project.status);
  const [type,      setType]      = useState(project.categoryAr);
  const [saved,     setSaved]     = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    updateProject(project.id, {
      nameAr:      name.trim(),
      nameEn:      name.trim(),
      description: desc.trim() || undefined,
      startDate:   startDate || undefined,
      status:      status as ProjectStatus,
      categoryAr:  type,
      categoryEn:  type,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          value={desc}
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
            items={STATUS_ITEMS}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'النوع' : 'Type'}</label>
          <Combobox
            items={TYPE_ITEMS}
            value={type}
            onChange={setType}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      <Button
        variant="primary"
        startIcon={<Check size={15} />}
        disabled={!name.trim()}
        onClick={handleSave}
      >
        {saved ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
      </Button>
    </div>
  );
}
