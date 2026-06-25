import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { inputCls } from './FormField';

export interface ComboboxItem {
  id:      string;
  label:   string;
  detail?: string;
  meta?:   string;
}

interface ComboboxProps {
  items:              ComboboxItem[];
  value:              string;
  onChange:           (id: string) => void;
  error?:             boolean;
  disabled?:          boolean;
  placeholder?:       string;
  searchPlaceholder?: string;
  noResultsText?:     string;
}

export function Combobox({
  items,
  value,
  onChange,
  error,
  disabled          = false,
  placeholder       = 'Select…',
  searchPlaceholder = 'Search…',
  noResultsText     = 'No results',
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.detail ?? '').toLowerCase().includes(q)
    );
  });

  const selected = items.find((i) => i.id === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${inputCls(!!error)} flex items-center justify-between gap-2 text-start ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selected ? (
          <span className="truncate text-gray-800 dark:text-gray-200">
            {selected.label}
            {selected.detail && (
              <span className="text-gray-400 dark:text-gray-500 ms-2 text-xs">{selected.detail}</span>
            )}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-800 shadow-xl z-50">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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

          {/* Options */}
          <ul className="max-h-52 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                {noResultsText}
              </li>
            ) : (
              filtered.map((item) => (
                <li
                  key={item.id}
                  onMouseDown={() => { onChange(item.id); setOpen(false); setQuery(''); }}
                  className={[
                    'flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors',
                    value === item.id
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  ].join(' ')}
                >
                  <span>
                    <span className="font-medium">{item.label}</span>
                    {item.detail && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ms-2">{item.detail}</span>
                    )}
                  </span>
                  {item.meta && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{item.meta}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
