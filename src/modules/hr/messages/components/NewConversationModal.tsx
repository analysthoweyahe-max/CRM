import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { EMPLOYEES } from '@/modules/hr/employees/data/employeeData';

interface Props {
  isAr:          boolean;
  currentUserId: string;
  loading?:      boolean;
  onSelect:      (empId: string, empName: string) => void;
  onClose:       () => void;
}

export function NewConversationModal({ isAr, currentUserId, loading, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES.filter(e => {
    if (e.id === currentUserId) return false;
    const name = isAr ? e.name : e.nameEn;
    return name.toLowerCase().includes(search.toLowerCase())
      || e.id.toLowerCase().includes(search.toLowerCase());
  });

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
          <div className="relative">
            <Search size={13}
              className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              placeholder={isAr ? 'ابحث باسم الموظف أو المعرّف...' : 'Search by name or ID...'}
              className="w-full ps-8 pe-3 py-2 text-sm rounded-lg
                         bg-gray-50 dark:bg-gray-700/60
                         border border-gray-200 dark:border-gray-600
                         text-gray-700 dark:text-gray-200
                         placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#A0CD39]/40"
            />
          </div>
        </div>

        {/* Employee list */}
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {isAr ? 'لا توجد نتائج' : 'No results'}
            </div>
          ) : (
            filtered.map(emp => {
              const name = isAr ? emp.name : emp.nameEn;
              const dept = isAr ? emp.department : emp.deptEn;
              return (
                <button
                  key={emp.id}
                  type="button"
                  disabled={loading}
                  onClick={() => onSelect(emp.id, name)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-start
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                             disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className={`w-9 h-9 rounded-full ${emp.avatarBg}
                                   flex items-center justify-center shrink-0`}>
                    <span className="text-sm font-bold text-white">{emp.initial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{dept}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
