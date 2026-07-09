import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { ProjectOptionalFields } from '@/shared/components/form/ProjectOptionalFields';
import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';
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

export interface ProjectFormFieldsProps {
  name:         string;
  description:  string;
  projectType:  string;
  status:       string;
  startDate:    string;
  deadline:     string;
  githubLink:   string;
  driveLink:    string;
  contractDurationMonths: string;
  optionalFieldErrors?: ProjectOptionalFieldErrors;
  typeItems:    PmLookupItem[];
  statusItems:  PmLookupItem[];
  templateItems?: ComboboxItem[];
  templateId?:    string;
  setTemplateId?: (v: string) => void;
  isAr:         boolean;
  setName:      (v: string) => void;
  setDesc:      (v: string) => void;
  setType:      (v: string) => void;
  setStatus:    (v: string) => void;
  setDate:      (v: string) => void;
  setDeadline:  (v: string) => void;
  setGithubLink: (v: string) => void;
  setDriveLink:  (v: string) => void;
  setContractDurationMonths: (v: string) => void;
  showManagerField?: boolean;
  managerId?:        string;
  setManagerId?:     (v: string) => void;
  managerItems?:     PmLookupItem[];
}

export function ProjectFormFields({
  name, description, projectType, status, startDate, deadline,
  githubLink, driveLink, contractDurationMonths, optionalFieldErrors,
  typeItems, statusItems,
  templateItems, templateId, setTemplateId,
  isAr,
  setName, setDesc, setType, setStatus, setDate, setDeadline,
  setGithubLink, setDriveLink, setContractDurationMonths,
  showManagerField, managerId, setManagerId, managerItems = [],
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-5">

      <div>
        <label className={LABEL}>
          {isAr ? 'اسم المشروع' : 'Project Name'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isAr ? 'مثال: موقع الشركة الإلكتروني' : 'e.g. Company Website'}
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>
          {isAr ? 'وصف المشروع' : 'Project Description'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder={isAr ? 'نبذة عن المشروع وأهدافه' : 'Brief about the project and its goals'}
          className={`${INPUT} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'نوع المشروع' : 'Project Type'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={toComboboxItems(typeItems, isAr)}
            value={projectType}
            onChange={setType}
            placeholder={isAr ? '-- اختر النوع --' : '-- Select Type --'}
            searchPlaceholder={isAr ? 'ابحث عن نوع...' : 'Search type...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'حالة المشروع' : 'Project Status'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={toComboboxItems(statusItems, isAr)}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {setTemplateId && (
        <div>
          <label className={LABEL}>
            {isAr ? 'قالب المشروع (اختياري)' : 'Project Template (optional)'}
          </label>
          <Combobox
            items={templateItems ?? []}
            value={templateId ?? ''}
            onChange={setTemplateId}
            placeholder={isAr ? '-- بدون قالب --' : '-- No template --'}
            searchPlaceholder={isAr ? 'ابحث عن قالب...' : 'Search template...'}
            noResultsText={isAr ? 'لا توجد قوالب لهذا النوع' : 'No templates for this type'}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {isAr
              ? 'تُنشأ مراحل المشروع تلقائياً من القالب المختار'
              : 'Project phases are created automatically from the selected template'}
          </p>
        </div>
      )}

      {showManagerField && (
        <div>
          <label className={LABEL}>
            {isAr ? 'مدير المشروع' : 'Project Manager'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={toComboboxItems(managerItems, isAr)}
            value={managerId ?? ''}
            onChange={setManagerId ?? (() => {})}
            placeholder={isAr ? '-- اختر المدير --' : '-- Select Manager --'}
            searchPlaceholder={isAr ? 'ابحث عن مدير...' : 'Search manager...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
          {managerItems.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              {isAr
                ? 'لا يوجد مدراء متاحون. عيّن دور «مدير مشاريع» لأدمن أولاً من صفحة «المديرون».'
                : 'No managers available. Assign the "project-manager" role to an admin first from the Managers page.'}
            </p>
          )}
        </div>
      )}

      <ProjectOptionalFields
        githubLink={githubLink}
        driveLink={driveLink}
        contractDurationMonths={contractDurationMonths}
        errors={optionalFieldErrors}
        isAr={isAr}
        onGithubLinkChange={setGithubLink}
        onDriveLinkChange={setDriveLink}
        onContractMonthsChange={setContractDurationMonths}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'تاريخ البدء' : 'Start Date'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            required
            type="date"
            value={startDate}
            onChange={e => setDate(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'الموعد النهائي' : 'Deadline'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            required
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

    </div>
  );
}
