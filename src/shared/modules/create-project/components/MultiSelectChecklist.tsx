import { useMemo, useState } from 'react';
import { SearchInput } from '@/shared/components/ui/SearchInput';

export interface ChecklistItem {
  id:      string;
  label:   string;
  detail?: string;
  meta?:   string;
}

interface Props {
  items:        ChecklistItem[];
  selected:     string[];
  onChange:     (ids: string[]) => void;
  isAr:         boolean;
  searchable?:  boolean;
  searchValue?: string;
  onSearch?:    (v: string) => void;
  loading?:     boolean;
  emptyText?:   string;
  error?:       string;
}

export function MultiSelectChecklist({
  items,
  selected,
  onChange,
  isAr,
  searchable = false,
  searchValue = '',
  onSearch,
  loading = false,
  emptyText,
  error,
}: Props) {
  const [localSearch, setLocalSearch] = useState('');
  const query = searchable && onSearch ? searchValue : localSearch;

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.detail?.toLowerCase().includes(q) ||
      item.meta?.toLowerCase().includes(q),
    );
  }, [items, query]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <SearchInput
          value={onSearch ? searchValue : localSearch}
          onChange={onSearch ?? setLocalSearch}
          placeholder={isAr ? 'ابحث...' : 'Search...'}
          className="max-w-md"
        />
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
          {emptyText ?? (isAr ? 'لا توجد عناصر' : 'No items found')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pe-1">
          {filtered.map(item => {
            const checked = selected.includes(item.id);
            return (
              <label
                key={item.id}
                className={[
                  'flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors',
                  checked
                    ? 'border-[#A0CD39] bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 shrink-0 accent-[#A0CD39]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {item.label}
                  </p>
                  {(item.detail || item.meta) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {[item.detail, item.meta].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isAr ? `تم اختيار ${selected.length}` : `${selected.length} selected`}
        </p>
      )}
    </div>
  );
}
