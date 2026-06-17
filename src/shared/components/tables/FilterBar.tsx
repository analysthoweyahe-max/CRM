import { ChevronDown, Search } from 'lucide-react';

interface SearchConfig {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}

export interface FilterConfig {
  key:     string;
  value:   string;
  onChange: (v: string) => void;
  options: string[];
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
      {filters?.map((f) => (
        <div key={f.key} className="relative">
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-700/50 ps-3 pe-8 text-sm
                       text-gray-700 dark:text-gray-300
                       outline-none focus:border-brand-400 focus:ring-2
                       focus:ring-brand-400/20 transition appearance-none cursor-pointer"
          >
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} className="absolute inset-y-0 my-auto inset-e-2 text-gray-400 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
