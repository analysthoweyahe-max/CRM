import type { ReactNode } from 'react';
import { Combobox } from '@/shared/components/form/Combobox';
import { inputCls } from '@/shared/components/form/FormField';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { TaskPeriodFilter } from '../utils/kanbanTaskFilters.utils';

interface Props {
  isAr:           boolean;
  phase:          string;
  assignee:       string;
  creator:        string;
  status:         string;
  period:         TaskPeriodFilter;
  dateFrom:       string;
  dateTo:         string;
  phaseItems:     ComboboxItem[];
  assigneeItems:  ComboboxItem[];
  creatorItems:   ComboboxItem[];
  statusItems:    ComboboxItem[];
  onPhase:        (id: string) => void;
  onAssignee:     (id: string) => void;
  onCreator:      (id: string) => void;
  onStatus:       (id: string) => void;
  onPeriod:       (id: TaskPeriodFilter) => void;
  onDateFrom:     (value: string) => void;
  onDateTo:       (value: string) => void;
  onClear:        () => void;
  hasActive:      boolean;
  resultCount:    number;
  totalCount:     number;
  hidePhase?:     boolean;
  hideStatus?:    boolean;
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="w-48 min-w-44 flex-1 sm:flex-none">
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export function KanbanTaskFilters({
  isAr,
  phase,
  assignee,
  creator,
  status,
  period,
  dateFrom,
  dateTo,
  phaseItems,
  assigneeItems,
  creatorItems,
  statusItems,
  onPhase,
  onAssignee,
  onCreator,
  onStatus,
  onPeriod,
  onDateFrom,
  onDateTo,
  onClear,
  hasActive,
  resultCount,
  totalCount,
  hidePhase,
  hideStatus,
}: Props) {
  const sp = isAr ? 'ابحث...' : 'Search...';
  const nr = isAr ? 'لا نتائج' : 'No results';

  const periodItems: ComboboxItem[] = [
    { id: '', label: isAr ? 'كل الفترات' : 'All periods' },
    { id: 'today', label: isAr ? 'يوم' : 'Today' },
    { id: '7days', label: isAr ? '7 أيام' : '7 days' },
    { id: '30days', label: isAr ? '30 يوم' : '30 days' },
    { id: 'custom', label: isAr ? 'مخصص' : 'Custom' },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4 px-1">
      {!hidePhase && (
        <FilterField label={isAr ? 'المرحلة' : 'Phase'}>
          <Combobox
            items={phaseItems}
            value={phase}
            onChange={onPhase}
            placeholder={isAr ? 'كل المراحل' : 'All phases'}
            searchPlaceholder={sp}
            noResultsText={nr}
          />
        </FilterField>
      )}
      <FilterField label={isAr ? 'المسؤول عن التنفيذ' : 'Assignee'}>
        <Combobox
          items={assigneeItems}
          value={assignee}
          onChange={onAssignee}
          placeholder={isAr ? 'كل المسؤولين' : 'All assignees'}
          searchPlaceholder={sp}
          noResultsText={nr}
        />
      </FilterField>
      <FilterField label={isAr ? 'من أنشأ المهمة' : 'Created by'}>
        <Combobox
          items={creatorItems}
          value={creator}
          onChange={onCreator}
          placeholder={isAr ? 'كل المنشئين' : 'All creators'}
          searchPlaceholder={sp}
          noResultsText={nr}
        />
      </FilterField>
      {!hideStatus && (
        <FilterField label={isAr ? 'الحالة' : 'Status'}>
          <Combobox
            items={statusItems}
            value={status}
            onChange={onStatus}
            placeholder={isAr ? 'كل الحالات' : 'All statuses'}
            searchPlaceholder={sp}
            noResultsText={nr}
          />
        </FilterField>
      )}
      <FilterField label={isAr ? 'تاريخ إنشاء المهمة' : 'Task creation date'}>
        <Combobox
          items={periodItems}
          value={period}
          onChange={(id) => onPeriod(id as TaskPeriodFilter)}
          placeholder={isAr ? 'الفترة الزمنية' : 'Period'}
          searchPlaceholder={sp}
          noResultsText={nr}
        />
      </FilterField>
      {period === 'custom' && (
        <>
          <div className="w-44 min-w-40 flex-1 sm:flex-none">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {isAr ? 'من' : 'From'}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFrom(e.target.value)}
              className={inputCls(false)}
              aria-label={isAr ? 'من تاريخ' : 'From date'}
            />
          </div>
          <div className="w-44 min-w-40 flex-1 sm:flex-none">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {isAr ? 'إلى' : 'To'}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateTo(e.target.value)}
              className={inputCls(false)}
              aria-label={isAr ? 'إلى تاريخ' : 'To date'}
            />
          </div>
        </>
      )}
      {hasActive && (
        <div className="flex items-center gap-3 pb-2">
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-[#709028] dark:text-gray-400
                       dark:hover:text-[#A0CD39] transition-colors"
          >
            {isAr ? 'مسح الفلتر' : 'Clear filters'}
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {isAr
              ? `عرض ${resultCount} من ${totalCount}`
              : `Showing ${resultCount} of ${totalCount}`}
          </span>
        </div>
      )}
    </div>
  );
}
