import { Combobox, type ComboboxItem } from '@/shared/components/form/Combobox';
import { SearchInput } from '@/shared/components/form/SearchInput';

interface SearchConfig {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}

export interface FilterConfig {
  key:                string;
  value:              string;
  onChange:           (v: string) => void;
  options?:           string[];       // simple list — id and label are the same string
  items?:             ComboboxItem[]; // full items when id ≠ label
  searchPlaceholder?: string;
  noResultsText?:     string;
  width?:             string;         // tailwind width class, e.g. "w-44"
}

interface FilterBarProps {
  search?:    SearchConfig;
  filters?:   FilterConfig[];
  className?: string;
}

export function FilterBar({ search, filters, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 px-5 py-4
                     border-b border-gray-100 dark:border-gray-700 ${className}`}>
      {search && (
        <SearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          className="flex-1 min-w-45"
        />
      )}

      {filters?.map((f) => {
        const items: ComboboxItem[] =
          f.items ?? (f.options ?? []).map((o) => ({ id: o, label: o }));

        return (
          <div key={f.key} className={f.width ?? 'w-44'}>
            <Combobox
              items={items}
              value={f.value}
              onChange={f.onChange}
              searchPlaceholder={f.searchPlaceholder ?? 'بحث...'}
              noResultsText={f.noResultsText ?? 'لا نتائج'}
            />
          </div>
        );
      })}
    </div>
  );
}
