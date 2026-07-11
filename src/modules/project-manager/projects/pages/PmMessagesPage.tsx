import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { matchesSearch } from '@/shared/utils/search.utils';
import { pmProjectsApi } from '../api/project.api';

const AVATAR_COLORS = [
  'bg-[#709028]', 'bg-blue-500', 'bg-purple-500',
  'bg-rose-500',  'bg-amber-500', 'bg-teal-500',
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Project-manager inbox: open each project's messages tab. */
export function PmMessagesPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pm-messages-projects'],
    queryFn:  () => pmProjectsApi.myProjects({ per_page: 100, is_draft: false }).then(r => r.data.data.data),
    staleTime: 30_000,
  });

  const projects = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    return list.filter(p => matchesSearch([p.name, p.statusLabel, p.projectTypeLabel], search));
  }, [data, search]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="-m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                 bg-white dark:bg-gray-900 rounded-none"
    >
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-4 text-gray-400 select-none px-6">
        <div className="w-16 h-16 rounded-full bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10
                        flex items-center justify-center">
          <MessageSquare size={28} className="text-[#A0CD39]" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {isAr ? 'اختر مشروعاً لفتح المحادثة' : 'Select a project to open chat'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isAr
              ? 'محادثات فريق العمل داخل كل مشروع'
              : 'Team conversations live inside each project'}
          </p>
        </div>
      </div>

      <div className="w-80 shrink-0 flex flex-col border-s border-gray-100 dark:border-gray-700/60">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAr ? 'محادثات المشاريع' : 'Project chats'}
          </h2>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={isAr ? 'بحث في المشاريع...' : 'Search projects...'}
            isAr={isAr}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-2/3" />
                  <div className="h-2.5 rounded bg-gray-100 dark:bg-gray-800 w-full" />
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-gray-400">
              <MessageSquare size={28} className="opacity-30" />
              <p className="text-xs">{isAr ? 'لا توجد مشاريع' : 'No projects'}</p>
            </div>
          ) : (
            projects.map(project => {
              const initial = project.name.charAt(0).toUpperCase();
              const color = avatarColor(String(project.id));
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`${ROUTES.PROJECT_MANAGER.DETAILS(String(project.id))}?tab=messages`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-start
                             hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                    <span className="text-sm font-bold text-white">{initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {project.statusLabel || project.projectTypeLabel}
                    </p>
                  </div>
                  <MessageSquare size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
