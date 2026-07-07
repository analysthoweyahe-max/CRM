import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface SearchInputProps {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
  isAr?:        boolean;
  delay?:       number;
  className?:   string;
  autoFocus?:   boolean;
}

/** Debounced search box shared across every list/filter search in the app.
 *  Keeps its own draft state so typing stays smooth (no request/refetch per
 *  keystroke) and only calls `onChange` once typing pauses for `delay`ms.
 *  Pair with `matchesSearch`/`normalizeSearchText` (@/shared/utils/search.utils)
 *  for Arabic-variant-tolerant matching (أ/إ/آ/ا, ة/ه, ى/ي, ...). */
export function SearchInput({
  value, onChange, placeholder, isAr = false, delay = 300, className = '', autoFocus = false,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebounce(draft, delay);

  // Parent-driven resets (e.g. a "clear filters" button) should show immediately.
  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder ?? (isAr ? 'بحث...' : 'Search...')}
        dir={isAr ? 'rtl' : 'ltr'}
        autoFocus={autoFocus}
        className="w-full h-10 ps-9 pe-4 rounded-xl border border-gray-200 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/30
                   focus:border-[#A0CD39] transition"
      />
    </div>
  );
}
