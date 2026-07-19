import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { inputCls } from './FormField';
import type { ComboboxItem } from './Combobox';

interface MultiComboboxProps {
  items:              ComboboxItem[];
  values:             string[];
  onChange:           (ids: string[]) => void;
  error?:             boolean;
  disabled?:          boolean;
  placeholder?:       string;
  searchPlaceholder?: string;
  noResultsText?:     string;
  /** When set, search is driven by the parent (e.g. server-side `?search=`). Local filtering is skipped. */
  onSearchChange?:    (query: string) => void;
  loading?:           boolean;
}

export function MultiCombobox({
  items,
  values,
  onChange,
  error,
  disabled          = false,
  placeholder       = 'Select…',
  searchPlaceholder = 'Search…',
  noResultsText     = 'No results',
  onSearchChange,
  loading           = false,
}: MultiComboboxProps) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const serverSearch = Boolean(onSearchChange);

  const selectedSet = new Set(values);
  const selectedItems = items.filter((i) => selectedSet.has(i.id));

  const filtered = serverSearch
    ? items
    : items.filter((item) => {
        const q = query.toLowerCase();
        return (
          (item.label ?? '').toLowerCase().includes(q) ||
          String(item.id ?? '').toLowerCase().includes(q) ||
          (item.detail ?? '').toLowerCase().includes(q)
        );
      });

  function handleQueryChange(next: string) {
    setQuery(next);
    onSearchChange?.(next);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        onSearchChange?.('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onSearchChange]);

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  }

  function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(values.filter((v) => v !== id));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${inputCls(!!error)} flex items-center justify-between gap-2 text-start min-h-[42px] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 py-0.5">
          {selectedItems.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            selectedItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 max-w-full rounded-md bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/15
                           text-[#709028] dark:text-[#A0CD39] px-2 py-0.5 text-xs font-medium"
              >
                <span className="truncate">{item.label}</span>
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => remove(item.id, e)}
                    className="shrink-0 rounded hover:bg-[#A0CD39]/30 p-0.5"
                    aria-label="Remove"
                  >
                    <X size={11} />
                  </span>
                )}
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-800 shadow-xl z-50">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <input
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-gray-700/50 ps-9 pe-3
                           text-sm text-gray-800 dark:text-gray-200
                           outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20
                           transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <Search size={14} className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <ul className="max-h-52 overflow-auto py-1">
            {loading && (
              <li className="px-3 py-4 text-center text-sm text-gray-400">…</li>
            )}
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                {noResultsText}
              </li>
            ) : (
              filtered.map((item) => {
                const active = selectedSet.has(item.id);
                return (
                  <li
                    key={item.id}
                    onMouseDown={() => toggle(item.id)}
                    className={[
                      'flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors',
                      active
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    ].join(' ')}
                  >
                    <span className="font-medium truncate">{item.label}</span>
                    {active && <Check size={14} className="shrink-0 text-[#709028]" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
