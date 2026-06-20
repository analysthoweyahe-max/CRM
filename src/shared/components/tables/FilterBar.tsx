import { Search } from 'lucide-react';
import { Combobox, type ComboboxItem } from '@/shared/components/form/Combobox';

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
        <div className="relative flex-1 min-w-45">
          <input
            type="text"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
            className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700/50 ps-4 pe-9
                       text-sm text-gray-800 dark:text-gray-200
                       outline-none focus:border-brand-400 focus:ring-2
                       focus:ring-brand-400/20 transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <Search size={14} className="absolute inset-y-0 my-auto inset-e-3 text-gray-400 pointer-events-none" />
        </div>
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
