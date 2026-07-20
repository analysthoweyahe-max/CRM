import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Search } from 'lucide-react';
import { inputCls } from './FormField';
import { externalLinkHref } from '@/shared/utils/format.utils';

export interface ComboboxItem {
  id:      string;
  label:   string;
  detail?: string;
  meta?:   string;
  /** Optional external URL — shows a link icon beside the label. */
  href?:   string | null;
}

interface ComboboxProps {
  items:              readonly ComboboxItem[];
  value:              string;
  onChange:           (id: string) => void;
  error?:             boolean;
  disabled?:          boolean;
  placeholder?:       string;
  searchPlaceholder?: string;
  noResultsText?:     string;
  /** When false, closed trigger shows label only (detail stays in the dropdown). Default true. */
  triggerShowsDetail?: boolean;
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
  triggerShowsDetail = true,
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      (item.label ?? '').toLowerCase().includes(q) ||
      String(item.id ?? '').toLowerCase().includes(q) ||
      (item.detail ?? '').toLowerCase().includes(q)
    );
  });

  const selected = items.find((i) => i.id === value);
  const selectedHref = selected ? externalLinkHref(selected.href) : null;

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
          <span className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="flex items-baseline gap-2 min-w-0 truncate text-gray-800 dark:text-gray-200">
              <span className="truncate font-medium">{selected.label}</span>
              {triggerShowsDetail && selected.detail && (
                <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">{selected.detail}</span>
              )}
            </span>
            {selectedHref && (
              <a
                href={selectedHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open link"
                className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-md
                           text-[#709028] dark:text-[#A0CD39] hover:bg-[#D8EBAE]/40 dark:hover:bg-[#D8EBAE]/10"
              >
                <ExternalLink size={14} />
              </a>
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
        <div className="absolute top-full inset-s-0 mt-1 min-w-full w-max max-w-[min(20rem,90vw)] rounded-xl border border-gray-200 dark:border-gray-600
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
              filtered.map((item) => {
                const itemHref = externalLinkHref(item.href);
                return (
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
                  <span className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="flex items-baseline gap-2 min-w-0">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.detail && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{item.detail}</span>
                      )}
                    </span>
                    {itemHref && (
                      <a
                        href={itemHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Open link"
                        className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-md
                                   text-[#709028] dark:text-[#A0CD39] hover:bg-[#D8EBAE]/40 dark:hover:bg-[#D8EBAE]/10"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </span>
                  {item.meta && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{item.meta}</span>
                  )}
                </li>
              );})
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
