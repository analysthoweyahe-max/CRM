import { useState } from 'react';
import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Combobox } from '@/shared/components/form/Combobox';
import type { TaskStatusCount } from '../types/taskBrief.types';

interface Props {
  icon:      ReactNode;
  iconBg:    string;
  titleAr:   string;
  titleEn:   string;
  total:     number;
  byStatus:  TaskStatusCount[];
  isAr:      boolean;
  isLoading?: boolean;
  /** Called with the currently-selected status key (or '' for all) when the card body is clicked. */
  onSelect:  (statusKey: string) => void;
}

export function TaskStatDropdownCard({
  icon, iconBg, titleAr, titleEn, total, byStatus, isAr, isLoading, onSelect,
}: Props) {
  const [selected, setSelected] = useState('');

  const items = [
    { id: '', label: isAr ? 'كل الحالات' : 'All Statuses' },
    ...byStatus.map(s => ({ id: s.key, label: s.label })),
  ];

  const count = selected === '' ? total : (byStatus.find(s => s.key === selected)?.count ?? 0);
  const title = isAr ? titleAr : titleEn;

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 hover:shadow-md transition-all w-full p-4">
      <button
        type="button"
        onClick={() => onSelect(selected)}
        className="w-full text-start"
        aria-label={title}
      >
        <ExternalLink size={13} className="absolute top-3 end-3 text-gray-300 dark:text-gray-600" />
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {isLoading ? '—' : count}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
          </div>
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
        </div>
      </button>

      <div className="mt-3">
        <Combobox
          items={items}
          value={selected}
          onChange={setSelected}
          placeholder={isAr ? 'كل الحالات' : 'All Statuses'}
          searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
      </div>
    </div>
  );
}
