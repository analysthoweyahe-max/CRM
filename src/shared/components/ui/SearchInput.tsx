import { Search } from 'lucide-react';

interface Props {
  value:        string;
  onChange:     (value: string) => void;
  placeholder:  string;
  className?:   string;
}

export function SearchInput({ value, onChange, placeholder, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:border-[#A0CD39] transition-colors ${className}`}>
      <Search size={15} className="text-gray-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none text-end"
        dir="auto"
      />
    </div>
  );
}
