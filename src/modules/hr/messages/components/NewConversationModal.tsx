import { useState } from 'react';
import { X } from 'lucide-react';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { useSearchEmployees } from '../hooks/useMessages';

interface Props {
  isAr:     boolean;
  loading?: boolean;
  onSelect: (empId: string) => void;
  onClose:  () => void;
}

const AVATAR_COLORS = ['bg-red-400','bg-blue-400','bg-green-500','bg-purple-400','bg-yellow-400','bg-pink-400'];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

export function NewConversationModal({ isAr, loading, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const { data: employees = [], isLoading } = useSearchEmployees(search);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'محادثة جديدة' : 'New Conversation'}
          </h3>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-end">
            {isAr ? 'ابحث عن موظف لبدء محادثة' : 'Search for an employee to start a conversation'}
          </p>
          <SearchInput
            value={search}
            onChange={setSearch}
            autoFocus
            placeholder={isAr ? 'ابحث باسم الموظف...' : 'Search by name...'}
            isAr={isAr}
          />
        </div>

        {/* Employee list */}
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : employees.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {isAr ? 'لا توجد نتائج' : 'No results'}
            </div>
          ) : employees.map(emp => (
            <button
              key={emp.id}
              type="button"
              disabled={loading}
              onClick={() => onSelect(emp.id)}
              className="w-full flex items-center gap-3 px-5 py-3 text-start
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                         disabled:opacity-50 disabled:cursor-wait"
            >
              <div className={`w-9 h-9 rounded-full ${avatarColor(emp.name)}
                               flex items-center justify-center shrink-0`}>
                <span className="text-sm font-bold text-white">{emp.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{emp.name}</p>
                {emp.department && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp.department}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
