import { Plus, Trash2 } from 'lucide-react';
import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { Button } from '@/shared/components/ui/Button';

const PROJECT_TYPE_ITEMS: ComboboxItem[] = [
  { id: 'موقع إلكتروني', label: 'موقع إلكتروني' },
  { id: 'تطبيق موبايل',  label: 'تطبيق موبايل'  },
  { id: 'نظام إدارة',    label: 'نظام إدارة'     },
  { id: 'لوحة تحكم',    label: 'لوحة تحكم'      },
  { id: 'تطبيق ويب',    label: 'تطبيق ويب'      },
  { id: 'أخرى',          label: 'أخرى'           },
];

const PROJECT_STATUS_ITEMS: ComboboxItem[] = [
  { id: 'notStarted', label: 'لم يبدأ'     },
  { id: 'inProgress', label: 'قيد التنفيذ' },
  { id: 'paused',     label: 'متوقف'       },
  { id: 'completed',  label: 'مكتمل'       },
];

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export interface ProjectFormFieldsProps {
  name:        string;
  description: string;
  projectType: string;
  status:      string;
  startDate:   string;
  links:       string[];
  isAr:        boolean;
  setName:     (v: string) => void;
  setDesc:     (v: string) => void;
  setType:     (v: string) => void;
  setStatus:   (v: string) => void;
  setDate:     (v: string) => void;
  addLink:     () => void;
  updateLink:  (i: number, v: string) => void;
  removeLink:  (i: number) => void;
}

export function ProjectFormFields({
  name, description, projectType, status, startDate, links, isAr,
  setName, setDesc, setType, setStatus, setDate,
  addLink, updateLink, removeLink,
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
            items={PROJECT_TYPE_ITEMS}
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
            items={PROJECT_STATUS_ITEMS}
            value={status}
            onChange={setStatus}
            searchPlaceholder={isAr ? 'ابحث عن حالة...' : 'Search status...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Start date */}
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

      {/* Links */}
      <div>
        <label className={LABEL}>{isAr ? 'مراجع وروابط' : 'References & Links'}</label>
        <div className="space-y-2.5">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={e => updateLink(i, e.target.value)}
                placeholder="https://..."
                className={`${INPUT} flex-1`}
              />
              {links.length > 1 && (
                <Button
                  variant="icon-danger"
                  onClick={() => removeLink(i)}
                >
                  <Trash2 size={15} />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Plus size={15} />}
            onClick={addLink}
            className="text-[#709028] dark:text-[#A0CD39]"
          >
            {isAr ? 'إضافة رابط' : 'Add Link'}
          </Button>
        </div>
      </div>

    </div>
  );
}
