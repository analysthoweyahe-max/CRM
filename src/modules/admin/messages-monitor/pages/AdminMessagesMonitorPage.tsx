import { Eye } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Avatar }     from '@/shared/components/ui/Avatar';
import { Combobox }   from '@/shared/components/form/Combobox';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { getAvatarColor } from '@/shared/utils';
import { useMessagesMonitor } from '../hooks/useMessagesMonitor';

export function AdminMessagesMonitorPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    messages, total, isLoading,
    projectId, setProjectId,
    source, setSource,
    search, setSearch,
    projectItems, sourceItems,
  } = useMessagesMonitor(isAr);

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'مراقبة الرسائل' : 'Messages Monitor'}
        subtitle={isAr
          ? 'عرض فقط لكل رسائل المشاريع — بدون إمكانية الإرسال'
          : 'Read-only view of all project messages — sending is disabled'}
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Combobox
          items={projectItems}
          value={projectId}
          onChange={setProjectId}
          placeholder={isAr ? 'كل المشاريع' : 'All projects'}
          searchPlaceholder={isAr ? 'ابحث عن مشروع...' : 'Search project...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
        <Combobox
          items={sourceItems}
          value={source}
          onChange={setSource}
          placeholder={isAr ? 'كل المصادر' : 'All sources'}
          searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
          noResultsText={isAr ? 'لا نتائج' : 'No results'}
        />
        <SearchInput value={search} onChange={setSearch} isAr={isAr} />
      </div>

      {/* Read-only banner */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028] dark:text-[#A0CD39] text-xs font-medium w-fit">
        <Eye size={14} />
        {isAr ? 'وضع المراقبة — قراءة فقط' : 'Monitor mode — read only'}
      </div>

      {/* Messages feed */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-14">
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-14">
            {isAr ? 'لا توجد رسائل' : 'No messages'}
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {messages.map((m, i) => {
              const senderName = m.sender?.name?.trim() || (isAr ? 'مستخدم' : 'Unknown');
              // Message ids are only unique within a single project, not across
              // the aggregated feed — key on project+id (falling back to index).
              const key = m.projectId != null ? `${m.projectId}-${m.id}` : `${m.id}-${i}`;
              return (
              <div key={key} className="flex items-start gap-3 px-4 py-3.5">
                <Avatar
                  initial={m.sender?.avatarInitial || senderName.slice(0, 1)}
                  color={getAvatarColor(senderName)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{senderName}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{m.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed break-words">{m.body || ''}</p>
                  <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    {m.projectName || '—'}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {total > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isAr ? `إجمالي الرسائل: ${total}` : `Total messages: ${total}`}
        </p>
      )}
    </div>
  );
}
