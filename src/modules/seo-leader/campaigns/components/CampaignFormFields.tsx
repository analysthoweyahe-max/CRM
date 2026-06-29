import { Combobox }   from '@/shared/components/form/Combobox';
import { ArrayInput } from '@/shared/components/form/ArrayInput';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export interface CampaignFormFieldsProps {
  name:         string;
  domain:       string;
  description:  string;
  campaignType: string;
  status:       string;
  startDate:    string;
  endDate:      string;
  keywords:     string[];
  links:        string[];
  isAr:         boolean;
  campaignTypeItems: ComboboxItem[];
  statusItems:       ComboboxItem[];
  setName:      (v: string) => void;
  setDomain:    (v: string) => void;
  setDesc:      (v: string) => void;
  setType:      (v: string) => void;
  setStatus:    (v: string) => void;
  setStartDate: (v: string) => void;
  setEndDate:   (v: string) => void;
  addKeyword:    () => void;
  updateKeyword: (i: number, v: string) => void;
  removeKeyword: (i: number) => void;
  addLink:      () => void;
  updateLink:   (i: number, v: string) => void;
  removeLink:   (i: number) => void;
}

export function CampaignFormFields({
  name, domain, description, campaignType, status, startDate, endDate, keywords, links, isAr,
  campaignTypeItems, statusItems,
  setName, setDomain, setDesc, setType, setStatus, setStartDate, setEndDate,
  addKeyword, updateKeyword, removeKeyword,
  addLink, updateLink, removeLink,
}: CampaignFormFieldsProps) {
  return (
    <div className="space-y-5">

      {/* Campaign name */}
      <div>
        <label className={LABEL}>
          {isAr ? 'اسم الحملة' : 'Campaign Name'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isAr ? 'مثال: موقع الشركة الإلكتروني' : 'e.g. Company Website SEO'}
          className={INPUT}
        />
      </div>

      {/* Target domain */}
      <div>
        <label className={LABEL}>
          {isAr ? 'الدومين المستهدف' : 'Target Domain'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <input
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="example.com"
          className={INPUT}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {isAr ? 'أدخل النطاق دون https://' : 'Enter domain without https://'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>{isAr ? 'وصف الحملة' : 'Campaign Description'}</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder={isAr ? 'نبذة عن الحملة وأهدافها' : 'Brief about the campaign and its goals'}
          className={`${INPUT} resize-none`}
        />
      </div>

      {/* Campaign type + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'نوع الحملة' : 'Campaign Type'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={campaignTypeItems}
            value={campaignType}
            onChange={setType}
            placeholder={isAr ? '-- اختر النوع --' : '-- Select Type --'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'حالة الحملة' : 'Campaign Status'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <Combobox
            items={statusItems}
            value={status}
            onChange={setStatus}
            placeholder={isAr ? '-- اختر الحالة --' : '-- Select Status --'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>
            {isAr ? 'تاريخ البدء' : 'Start Date'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>
            {isAr ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'}
            <span className="text-red-500 ms-1">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className={LABEL}>
          {isAr ? 'الكلمات المفتاحية المستهدفة الرئيسية' : 'Primary Target Keywords'}
          <span className="text-red-500 ms-1">*</span>
        </label>
        <ArrayInput
          values={keywords}
          type="text"
          placeholder={isAr ? 'أدخل كلمة مفتاحية' : 'Enter keyword'}
          addLabel={isAr ? 'إضافة كلمة' : 'Add Keyword'}
          onAdd={addKeyword}
          onUpdate={updateKeyword}
          onRemove={removeKeyword}
        />
      </div>

      {/* Links */}
      <div>
        <label className={LABEL}>{isAr ? 'مراجع وروابط' : 'References & Links'}</label>
        <ArrayInput
          values={links}
          type="url"
          placeholder="https://..."
          addLabel={isAr ? 'إضافة رابط' : 'Add Link'}
          onAdd={addLink}
          onUpdate={updateLink}
          onRemove={removeLink}
        />
      </div>

    </div>
  );
}
