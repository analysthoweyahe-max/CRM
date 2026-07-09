import { Combobox, type ComboboxItem } from '@/shared/components/form/Combobox';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { Switch } from '@/shared/components/ui/Switch';
import type { StatusLookupItem } from '../types/myProjects.types';

interface Props {
  isAr:           boolean;
  search:         string;
  onSearchChange: (v: string) => void;
  canSearch:      boolean;
  status:         string;
  onStatusChange: (v: string) => void;
  canFilterStatus: boolean;
  statusOptions:  StatusLookupItem[];
  showDrafts:     boolean;
  onDraftsChange: (v: boolean) => void;
  canToggleDraft: boolean;
}

export function MyProjectsFilters({
  isAr,
  search,
  onSearchChange,
  canSearch,
  status,
  onStatusChange,
  canFilterStatus,
  statusOptions,
  showDrafts,
  onDraftsChange,
  canToggleDraft,
}: Props) {
  if (!canSearch && !canFilterStatus && !canToggleDraft) return null;

  const statusItems: ComboboxItem[] = [
    { id: '', label: isAr ? 'كل الحالات' : 'All statuses' },
    ...statusOptions.map(o => ({
      id:    o.value,
      label: isAr ? (o.labelAr ?? o.label) : o.label,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canSearch && (
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={isAr ? 'ابحث عن مشروع...' : 'Search projects...'}
          className="flex-1 min-w-[220px] max-w-sm"
        />
      )}

      {canFilterStatus && (
        <div className="w-44">
          <Combobox
            items={statusItems}
            value={status}
            onChange={onStatusChange}
            searchPlaceholder={isAr ? 'بحث...' : 'Search...'}
            noResultsText={isAr ? 'لا نتائج' : 'No results'}
          />
        </div>
      )}

      {canToggleDraft && (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Switch
            checked={showDrafts}
            onChange={() => onDraftsChange(!showDrafts)}
            ariaLabel={isAr ? 'عرض المسودات' : 'Show drafts'}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isAr ? 'عرض المسودات' : 'Show drafts'}
          </span>
        </label>
      )}
    </div>
  );
}
