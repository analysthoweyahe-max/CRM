import { Search, ChevronDown } from 'lucide-react';

interface FilterSelectProps {
  value:    string;
  options:  string[];
  onChange: (v: string) => void;
}

function FilterSelect({ value, options, onChange }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 ps-3 pe-8 rounded-xl border border-gray-200
                   dark:border-gray-600 bg-white dark:bg-gray-800
                   text-sm text-gray-700 dark:text-gray-200
                   focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/30
                   focus:border-[#A0CD39] transition cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute inset-y-0 my-auto inset-e-2.5 text-gray-400" />
    </div>
  );
}

interface EmployeeFiltersProps {
  isAr:          boolean;
  search:        string;
  deptFilter:    string;
  titleFilter:   string;
  statusFilter:  string;
  deptOptions:   string[];
  titleOptions:  string[];
  statusOptions: string[];
  onSearch:      (v: string) => void;
  onDept:        (v: string) => void;
  onTitle:       (v: string) => void;
  onStatus:      (v: string) => void;
}

export function EmployeeFilters({
  isAr, search, deptFilter, titleFilter, statusFilter,
  deptOptions, titleOptions, statusOptions,
  onSearch, onDept, onTitle, onStatus,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-52">
        <Search size={14} className="absolute inset-y-0 my-auto inset-s-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={isAr ? 'ابحث بالاسم او البريد او الهاتف...' : 'Search by name, email or phone...'}
          className="w-full h-10 ps-9 pe-4 rounded-xl border border-gray-200
                     dark:border-gray-600 bg-white dark:bg-gray-800
                     text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/30
                     focus:border-[#A0CD39] transition"
        />
      </div>

      <FilterSelect value={deptFilter}   options={deptOptions}   onChange={onDept}   />
      <FilterSelect value={titleFilter}  options={titleOptions}  onChange={onTitle}  />
      <FilterSelect value={statusFilter} options={statusOptions} onChange={onStatus} />
    </div>
  );
}
