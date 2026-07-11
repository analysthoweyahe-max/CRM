import { useState } from 'react';
import { X } from 'lucide-react';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { extractApiError } from '@/shared/utils/error.utils';
import { useSeoMentionables } from '../hooks/useSeoMessages';
import type { SeoMentionable } from '../types/messages.types';

const AVATAR_COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-500', 'bg-purple-400',
  'bg-yellow-400', 'bg-pink-400',
];

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  'super-admin':     { ar: 'سوبر أدمن',      en: 'Super Admin' },
  'seo-manager':     { ar: 'مدير SEO',       en: 'SEO Manager' },
  'hr-manager':      { ar: 'مدير HR',        en: 'HR Manager' },
  'project-manager': { ar: 'مدير مشاريع',    en: 'Project Manager' },
};

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function personDetail(person: SeoMentionable, isAr: boolean) {
  if (person.type === 'admin') {
    const role = person.role ? ROLE_LABELS[person.role] : null;
    if (role) return isAr ? role.ar : role.en;
    return isAr ? 'مدير' : 'Manager';
  }
  return person.department?.trim()
    || (isAr ? 'موظف' : 'Employee');
}

interface Props {
  isAr:     boolean;
  loading?: boolean;
  onSelect: (person: SeoMentionable) => void;
  onClose:  () => void;
}

export function NewSeoConversationModal({ isAr, loading, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const {
    data: people = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSeoMentionables(true, search);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
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

        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-end">
            {isAr ? 'ابحث عن موظف أو مدير لبدء محادثة' : 'Search for an employee or manager'}
          </p>
          <SearchInput
            value={search}
            onChange={setSearch}
            autoFocus
            placeholder={isAr ? 'ابحث بالاسم...' : 'Search by name...'}
            isAr={isAr}
          />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : isError ? (
            <div className="py-10 px-4 text-center space-y-2">
              <p className="text-sm text-red-500">
                {extractApiError(error) || (isAr ? 'تعذّر تحميل القائمة' : 'Failed to load list')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-medium text-[#709028] hover:underline"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : people.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {isAr ? 'لا توجد نتائج' : 'No results'}
            </div>
          ) : people.map(person => (
            <button
              key={`${person.type}:${person.id}`}
              type="button"
              disabled={loading}
              onClick={() => onSelect(person)}
              className="w-full flex items-center gap-3 px-5 py-3 text-start
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                         disabled:opacity-50 disabled:cursor-wait"
            >
              <div className={`w-9 h-9 rounded-full ${avatarColor(person.name)}
                               flex items-center justify-center shrink-0`}>
                <span className="text-sm font-bold text-white">
                  {(person.avatarInitial ?? person.name.charAt(0)).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {person.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {personDetail(person, isAr)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
