import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ProjectOptionalFields } from '@/shared/components/form/ProjectOptionalFields';
import type { SelectOption } from '../api/campaign.api';
import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-end';

function inputDir(isAr: boolean) {
  return isAr ? 'rtl' : 'ltr';
}

function toComboboxItems(opts: SelectOption[], isAr: boolean): ComboboxItem[] {
  return opts.map(o => ({
    id:    o.value,
    label: translateProjectLookup(o.value, o.label, isAr),
  }));
}

interface Props {
  name:          string;
  startDate:     string;
  domain:        string;
  desc:          string;
  status:        string;
  type:          string;
  githubLink:    string;
  driveLink:     string;
  contractDurationMonths: string;
  optionalFieldErrors?: ProjectOptionalFieldErrors;
  statusOptions: SelectOption[];
  typeOptions:   SelectOption[];
  onChangeName:      (v: string) => void;
  onChangeStartDate: (v: string) => void;
  onChangeDomain:    (v: string) => void;
  onChangeDesc:      (v: string) => void;
  onChangeStatus:    (v: string) => void;
  onChangeType:      (v: string) => void;
  onChangeGithubLink: (v: string) => void;
  onChangeDriveLink:  (v: string) => void;
  onChangeContractDurationMonths: (v: string) => void;
  onSave:        () => void;
  isSaving:      boolean;
  saved:         boolean;
  canSave:       boolean;
  isAr:          boolean;
}

export function SeoProjectInfoForm({
  name, startDate, domain, desc, status, type,
  githubLink, driveLink, contractDurationMonths, optionalFieldErrors,
  statusOptions, typeOptions,
  onChangeName, onChangeStartDate, onChangeDomain, onChangeDesc,
  onChangeStatus, onChangeType,
  onChangeGithubLink, onChangeDriveLink, onChangeContractDurationMonths,
  onSave, isSaving, saved, canSave, isAr,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'معلومات المشروع' : 'Project Information'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'اسم المشروع' : 'Project Name'}</label>
          <input type="text" value={name} onChange={e => onChangeName(e.target.value)} className={INPUT} dir={inputDir(isAr)} />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'تاريخ البدء' : 'Start Date'}</label>
          <input type="date" value={startDate} onChange={e => onChangeStartDate(e.target.value)} className={INPUT} dir={inputDir(isAr)} />
        </div>
      </div>

      <div>
        <label className={LABEL}>{isAr ? 'الدومين المستهدف' : 'Target Domain'}</label>
        <input type="text" value={domain} onChange={e => onChangeDomain(e.target.value)} placeholder="example.com" className={INPUT} dir={inputDir(isAr)} />
      </div>

      <div>
        <label className={LABEL}>{isAr ? 'الوصف' : 'Description'}</label>
        <textarea rows={3} value={desc} onChange={e => onChangeDesc(e.target.value)} className={`${INPUT} resize-none`} dir={inputDir(isAr)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>{isAr ? 'الحالة' : 'Status'}</label>
          <Combobox items={toComboboxItems(statusOptions, isAr)} value={status} onChange={onChangeStatus}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'} noResultsText={isAr ? 'لا توجد نتائج' : 'No results'} />
        </div>
        <div>
          <label className={LABEL}>{isAr ? 'النوع' : 'Type'}</label>
          <Combobox items={toComboboxItems(typeOptions, isAr)} value={type} onChange={onChangeType}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'} noResultsText={isAr ? 'لا توجد نتائج' : 'No results'} />
        </div>
      </div>

      <ProjectOptionalFields
        githubLink={githubLink}
        driveLink={driveLink}
        contractDurationMonths={contractDurationMonths}
        errors={optionalFieldErrors}
        isAr={isAr}
        showGithubLink={false}
        onGithubLinkChange={onChangeGithubLink}
        onDriveLinkChange={onChangeDriveLink}
        onContractMonthsChange={onChangeContractDurationMonths}
      />

      <Button variant="primary" startIcon={<Check size={15} />} disabled={!canSave} onClick={onSave}>
        {isSaving
          ? (isAr ? 'جارٍ الحفظ...' : 'Saving…')
          : saved
            ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓')
            : (isAr ? 'حفظ' : 'Save')}
      </Button>
    </div>
  );
}
