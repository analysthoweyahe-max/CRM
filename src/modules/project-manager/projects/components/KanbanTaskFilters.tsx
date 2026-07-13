import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

interface Props {
  isAr:          boolean;
  phase:         string;
  assignee:      string;
  phaseItems:    ComboboxItem[];
  assigneeItems: ComboboxItem[];
  onPhase:       (id: string) => void;
  onAssignee:    (id: string) => void;
  onClear:       () => void;
  hasActive:     boolean;
  resultCount:   number;
  totalCount:    number;
  hidePhase?:    boolean;
}

export function KanbanTaskFilters({
  isAr,
  phase,
  assignee,
  phaseItems,
  assigneeItems,
  onPhase,
  onAssignee,
  onClear,
  hasActive,
  resultCount,
  totalCount,
  hidePhase,
}: Props) {
  const sp = isAr ? 'ابحث...' : 'Search...';
  const nr = isAr ? 'لا نتائج' : 'No results';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
      {!hidePhase && (
        <div className="w-48 min-w-[11rem] flex-1 sm:flex-none">
          <Combobox
            items={phaseItems}
            value={phase}
            onChange={onPhase}
            placeholder={isAr ? 'المرحلة' : 'Phase'}
            searchPlaceholder={sp}
            noResultsText={nr}
          />
        </div>
      )}
      <div className="w-48 min-w-[11rem] flex-1 sm:flex-none">
        <Combobox
          items={assigneeItems}
          value={assignee}
          onChange={onAssignee}
          placeholder={isAr ? 'عضو الفريق' : 'Team member'}
          searchPlaceholder={sp}
          noResultsText={nr}
        />
      </div>
      {hasActive && (
        <>
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
        </>
      )}
    </div>
  );
}
