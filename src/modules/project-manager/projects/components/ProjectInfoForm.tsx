import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ProjectOptionalFields } from '@/shared/components/form/ProjectOptionalFields';
import { useProjectSettings } from '../hooks/useProjectSettings';
import { usePmProjectLookups } from '../hooks/usePmProjectLookups';
import { pmProjectsApi } from '../api/project.api';
import type { PmLookupItem, PmProjectPayload } from '../types/project.types';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { extractApiError, extractApiFieldErrors } from '@/shared/utils/error.utils';
import {
  optionalLink,
  optionalContractDurationMonths,
  validateProjectOptionalFields,
} from '@/shared/utils/projectOptionalFields.utils';
import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

function inputDir(isAr: boolean) {
  return isAr ? 'rtl' : 'ltr';
}

function lookupLabel(l: PmLookupItem, isAr: boolean): string {
  if (isAr && l.labelAr) return l.labelAr;
  return translateProjectLookup(l.value, l.label, isAr, l.labelAr);
}

function toComboboxItems(lookups: PmLookupItem[], isAr: boolean): ComboboxItem[] {
  return lookups.map(l => ({
    id:    l.value,
    label: lookupLabel(l, isAr),
  }));
}

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectInfoForm({ projectId, isAr }: Props) {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';
  const queryClient = useQueryClient();
  const { settings, isLoading } = useProjectSettings(projectId);
  const { statuses, types, managers } = usePmProjectLookups({ includeManagers: isAdmin });

  const statusLookupItems = settings?.statusOptions?.length
    ? settings.statusOptions
    : statuses;
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('');
  const [optionalFieldErrors, setOptionalFieldErrors] = useState<ProjectOptionalFieldErrors>({});
  const [status, setStatus] = useState('');
  const [projectType, setType] = useState('');
  const [managerId, setManagerId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setDesc(settings.description ?? '');
    setStartDate(settings.startDate ?? '');
    setDeadline(settings.deadline ?? '');
    setGithubLink(settings.githubLink ?? '');
    setDriveLink(settings.driveLink ?? '');
    setContractDurationMonths(
      settings.contractDurationMonths != null ? String(settings.contractDurationMonths) : '',
    );
    setStatus(settings.status);
    setType(String(settings.projectTypeId ?? settings.projectType));
    setManagerId(settings.manager?.id ?? '');
  }, [settings]);

  function validateOptionalFields() {
    const errors = validateProjectOptionalFields(githubLink, driveLink, contractDurationMonths, isAr);
    setOptionalFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!name.trim() || saving || !settings) return;
    if (!validateOptionalFields()) return;

    setSaving(true);
    try {
      const next = {
        name:            name.trim(),
        description:     description.trim(),
        projectTypeId:   Number(projectType) || undefined,
        status,
        isDraft:         settings.isDraft ?? false,
        startDate:       startDate || null,
        deadline:        deadline || null,
        githubLink:      optionalLink(githubLink),
        driveLink:       optionalLink(driveLink),
        contractDurationMonths: optionalContractDurationMonths(contractDurationMonths),
        ...(isAdmin && managerId ? { managerIds: [managerId] as string[] } : {}),
      };

      const baseline = {
        name:            settings.name,
        description:     settings.description ?? '',
        projectTypeId:   settings.projectTypeId ?? undefined,
        status:          settings.status,
        isDraft:         settings.isDraft ?? false,
        startDate:       settings.startDate || null,
        deadline:        settings.deadline || null,
        githubLink:      settings.githubLink ?? null,
        driveLink:       settings.driveLink ?? null,
        contractDurationMonths: settings.contractDurationMonths ?? null,
        ...(isAdmin ? { managerIds: settings.manager?.id ? [settings.manager.id] : [] } : {}),
      };

      const payload = Object.fromEntries(
        Object.entries(next).filter(([key, value]) => {
          const prev = baseline[key as keyof typeof baseline];
          if (Array.isArray(value) && Array.isArray(prev)) {
            return value.join() !== prev.join();
          }
          return value !== prev;
        }),
      ) as Partial<PmProjectPayload>;

      if (Object.keys(payload).length === 0) {
        toast.success(isAr ? 'لا توجد تغييرات' : 'No changes');
        return;
      }

      await pmProjectsApi.update(projectId, payload);
      queryClient.invalidateQueries({ queryKey: ['pm-project-settings', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pm-project'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] });
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
    } catch (err) {
      const apiFieldErrors = extractApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setOptionalFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
      } else {
        toast.error(extractApiError(err) || (isAr ? 'تعذر حفظ التعديلات' : 'Failed to save changes'));
      }
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

  const hasOptionalErrors = Object.keys(optionalFieldErrors).length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'معلومات المشروع' : 'Project Information'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'اسم المشروع' : 'Project Name'}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={INPUT} dir={inputDir(isAr)} />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT} dir={inputDir(isAr)} />
        </div>
      </div>

      <div>
        <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder={isAr ? 'وصف المشروع وأهدافه...' : 'Project description and goals…'}
          className={`${INPUT} resize-none`}
          dir={inputDir(isAr)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'الحالة' : 'Status'}</label>
          <Combobox
            items={toComboboxItems(statusLookupItems, isAr)}
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

      <ProjectOptionalFields
        githubLink={githubLink}
        driveLink={driveLink}
        contractDurationMonths={contractDurationMonths}
        errors={optionalFieldErrors}
        isAr={isAr}
        onGithubLinkChange={(v) => {
          setGithubLink(v);
          if (optionalFieldErrors.githubLink) validateOptionalFields();
        }}
        onDriveLinkChange={(v) => {
          setDriveLink(v);
          if (optionalFieldErrors.driveLink) validateOptionalFields();
        }}
        onContractMonthsChange={(v) => {
          setContractDurationMonths(v);
          if (optionalFieldErrors.contractDurationMonths) validateOptionalFields();
        }}
      />

      <div>
        <label className={LABEL}>{isAr ? 'الموعد النهائي' : 'Deadline'}</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={INPUT} dir={inputDir(isAr)} />
      </div>

      <Button
        variant="primary"
        startIcon={<Check size={15} />}
        disabled={!name.trim() || saving || hasOptionalErrors}
        onClick={handleSave}
      >
        {isAr ? 'حفظ' : 'Save'}
      </Button>
    </div>
  );
}
