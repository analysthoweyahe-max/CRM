import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { PmLookupItem } from '../types/project.types';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

function toComboboxItems(lookups: PmLookupItem[]): ComboboxItem[] {
  return lookups.map(l => ({ id: l.value, label: l.label }));
}

export interface ProjectFormFieldsProps {
  name:         string;
  description:  string;
  projectType:  string;
  status:       string;
  startDate:    string;
  deadline:     string;
  githubUrl:    string;
  typeItems:    PmLookupItem[];
  statusItems:  PmLookupItem[];
  isAr:         boolean;
  setName:      (v: string) => void;
  setDesc:      (v: string) => void;
  setType:      (v: string) => void;
  setStatus:    (v: string) => void;
  setDate:      (v: string) => void;
  setDeadline:  (v: string) => void;
  setGithubUrl: (v: string) => void;
}

export function ProjectFormFields({
  name, description, projectType, status, startDate, deadline, githubUrl, typeItems, statusItems, isAr,
  setName, setDesc, setType, setStatus, setDate, setDeadline, setGithubUrl,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-5">

      {/* Project name */}
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

      {/* Description */}
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

      {/* Type + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'نوع المشروع' : 'Project Type'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={toComboboxItems(typeItems)}
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
            items={toComboboxItems(statusItems)}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* GitHub link */}
      <div>
        <label className={LABEL}>
          {isAr ? 'رابط GitHub' : 'GitHub Link'}
        </label>
        <input
          type="url"
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          dir="ltr"
          className={INPUT}
        />
      </div>

      {/* Start date + Deadline */}
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
