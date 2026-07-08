import { useState, useEffect } from 'react';
import { Check }    from 'lucide-react';
import { toast }    from 'sonner';
import { useAuth }  from '@/modules/auth/context/AuthContext';
import { Button }   from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useProjectSettings }      from '../hooks/useProjectSettings';
import { usePmProjectLookups }     from '../hooks/usePmProjectLookups';
import type { PmLookupItem } from '../types/project.types';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { isSeoType, addMonths, monthsBetween } from '../utils/seoProject';

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
    label: translateProjectLookup(l.value, l.label, isAr, l.labelAr),
  }));
}

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectInfoForm({ projectId, isAr }: Props) {
  const { user }  = useAuth();
  // Reassigning a project's manager is a super-admin-only action (maps to the
  // `admin` app role); regular project-managers must not see/send manager_id.
  const isAdmin   = user?.role === 'admin';
  const { settings, isLoading, save } = useProjectSettings(projectId);
  const { statuses, types, managers } = usePmProjectLookups({ includeManagers: isAdmin });

  const [name,        setName]        = useState('');
  const [description, setDesc]        = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [deadline,    setDeadline]    = useState('');
  const [contractMonths, setContractMonths] = useState('');
  const [githubUrl,   setGithubUrl]   = useState('');
  const [status,      setStatus]      = useState('');
  const [projectType, setType]        = useState('');
  const [managerId,   setManagerId]   = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setDesc(settings.description ?? '');
    setStartDate(settings.startDate ?? '');
    setDeadline(settings.deadline ?? '');
    setContractMonths(monthsBetween(settings.startDate ?? '', settings.deadline ?? ''));
    setGithubUrl(settings.githubLink ?? '');
    setStatus(settings.status);
    setType(settings.projectType);
    setManagerId(settings.manager?.id ?? '');
  }, [settings]);

  const isSeo = isSeoType(types, projectType);

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
        deadline:        isSeo ? addMonths(startDate, Number(contractMonths)) : deadline,
        github_link:     githubUrl.trim() || undefined,
        ...(isAdmin && managerId ? { manager_id: managerId } : {}),
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

      {/* Project manager — super admin only (change assignment after creation) */}
      {isAdmin && (
        <div>
          <label className={LABEL}>{isAr ? 'مدير المشروع' : 'Project Manager'}</label>
          <Combobox
            items={toComboboxItems(managers, isAr)}
            value={managerId}
            onChange={setManagerId}
            placeholder={isAr ? '-- اختر المدير --' : '-- Select Manager --'}
            searchPlaceholder={isAr ? 'ابحث عن مدير...' : 'Search manager...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      )}

      {/* Drive folder link (SEO) / GitHub link (everything else) */}
      <div>
        <label className={LABEL}>
          {isSeo
            ? (isAr ? 'رابط فولدر الدرايف' : 'Drive Folder Link')
            : (isAr ? 'رابط GitHub' : 'GitHub Link')}
        </label>
        <input
          type="url"
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder={isSeo ? 'https://drive.google.com/drive/folders/...' : 'https://github.com/org/repo'}
          dir="ltr"
          className={INPUT}
        />
      </div>

      {/* Deadline (or Contract Duration for SEO) */}
      {isSeo ? (
        <div>
          <label className={LABEL}>{isAr ? 'مدة العقد (بالأشهر)' : 'Contract Duration (months)'}</label>
          <input
            type="number"
            min={1}
            value={contractMonths}
            onChange={e => setContractMonths(e.target.value)}
            placeholder={isAr ? 'مثال: 6' : 'e.g. 6'}
            className={INPUT}
          />
        </div>
      ) : (
        <div>
          <label className={LABEL}>{isAr ? 'الموعد النهائي' : 'Deadline'}</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className={INPUT}
          />
        </div>
      )}

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
