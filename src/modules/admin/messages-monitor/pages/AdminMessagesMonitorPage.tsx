import { Eye, MessageSquare, MessagesSquare, Users } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Avatar }     from '@/shared/components/ui/Avatar';
import { SearchInput } from '@/shared/components/form/SearchInput';
import { getAvatarColor } from '@/shared/utils';
import { useMessagesMonitor } from '../hooks/useMessagesMonitor';
import { partyTypeLabel } from '../utils/monitor.utils';
import type { MonitoredConversation } from '../types/monitor.types';

function fmtTime(raw: string, isAr: boolean): string {
  if (!raw) return '';
  const d = new Date(raw.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function typeLabel(c: MonitoredConversation, isAr: boolean): string {
  if (c.type === 'group') return isAr ? 'مجموعة' : 'Group';
  return isAr ? 'محادثة مباشرة' : 'Direct';
}

export function AdminMessagesMonitorPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    conversations,
    activeConversation,
    threadMessages,
    isLoading,
    loadingThread,
    isError,
    errorMessage,
    search, setSearch,
    selectConversation,
    refetch,
    partiesLabel,
  } = useMessagesMonitor(isAr);

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'مراقبة الرسائل' : 'Messages Monitor'}
        subtitle={isAr
          ? 'كل المحادثات الفورية (بما فيها وضع المراقب) — قراءة فقط'
          : 'All instant conversations (including observer mode) — read only'}
      />

      <SearchInput value={search} onChange={setSearch} isAr={isAr} />

      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028] dark:text-[#A0CD39] text-xs font-medium w-fit">
        <Eye size={14} />
        {isAr ? 'وضع المراقبة — قراءة فقط (بدون إرسال)' : 'Monitor mode — read only (no sending)'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
        <aside className="lg:col-span-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <MessagesSquare size={16} className="text-[#709028]" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {isAr ? `المحادثات (${conversations.length})` : `Conversations (${conversations.length})`}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[70vh]">
            {isLoading ? (
              <p className="text-center text-sm text-gray-400 py-14">
                {isAr ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-14 px-4 text-center">
                <p className="text-sm text-red-500">
                  {errorMessage || (isAr ? 'تعذّر تحميل المحادثات' : 'Failed to load conversations')}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="text-xs font-medium text-[#709028] dark:text-[#A0CD39] hover:underline"
                >
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-14 px-4">
                {isAr ? 'لا توجد محادثات فورية' : 'No instant conversations'}
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {conversations.map((c) => {
                  const active = activeConversation?.id === c.id;
                  const title = partiesLabel(c) || c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectConversation(c)}
                      className={`w-full text-start px-4 py-3 transition-colors ${
                        active
                          ? 'bg-[#D8EBAE]/35 dark:bg-[#A0CD39]/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                          {c.type === 'group' ? <Users size={15} /> : <MessageSquare size={15} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                              {title}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {fmtTime(c.lastMessageAt || '', isAr)}
                            </span>
                          </div>
                          {c.lastMessage && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {c.lastMessage}
                            </p>
                          )}
                          {c.parties.length > 0 && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {c.parties.map((p) => {
                                const role = partyTypeLabel(p.type, isAr);
                                return role ? `${p.name} (${role})` : p.name;
                              }).join(isAr ? ' · ' : ' · ')}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                              {typeLabel(c, isAr)}
                            </span>
                            {c.isObserver && (
                              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                                {isAr ? 'مراقب' : 'Observer'}
                              </span>
                            )}
                            {c.unreadCount > 0 && (
                              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[#A0CD39]/25 text-[#709028]">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="lg:col-span-8 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 px-6 text-center">
              <MessageSquare size={28} className="opacity-50" />
              <p className="text-sm">
                {isAr
                  ? 'اختر محادثة لعرض الرسائل بين الطرفين'
                  : 'Select a conversation to view messages between both parties'}
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {partiesLabel(activeConversation) || activeConversation.name}
                  </h2>
                  {activeConversation.isObserver && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                      {isAr ? 'مراقب' : 'Observer'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {typeLabel(activeConversation, isAr)}
                  {activeConversation.parties.length > 0 && (
                    <>
                      {' · '}
                      {activeConversation.parties.map((p) => {
                        const role = partyTypeLabel(p.type, isAr);
                        return role ? `${p.name} (${role})` : p.name;
                      }).join(isAr ? ' و ' : ' & ')}
                    </>
                  )}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[70vh] px-4 py-4 space-y-3 bg-gray-50/60 dark:bg-gray-900/30">
                {loadingThread ? (
                  <p className="text-center text-sm text-gray-400 py-10">
                    {isAr ? 'جاري تحميل الرسائل...' : 'Loading messages...'}
                  </p>
                ) : threadMessages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">
                    {isAr ? 'لا توجد رسائل في هذه المحادثة' : 'No messages in this conversation'}
                  </p>
                ) : (
                  threadMessages.map((m, i) => {
                    const senderName = m.sender?.name?.trim()
                      || (isAr ? 'مرسل غير معروف' : 'Unknown sender');
                    const senderRole = partyTypeLabel(m.sender?.type, isAr);
                    return (
                      <div key={`${m.id}-${i}`} className="flex items-start gap-2.5 max-w-[92%]">
                        <Avatar
                          initial={m.sender?.avatarInitial || senderName.slice(0, 1)}
                          color={getAvatarColor(senderName)}
                          size="sm"
                        />
                        <div className="rounded-2xl rounded-ss-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3.5 py-2.5 shadow-sm min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-0.5">
                            <span className="text-xs font-semibold text-[#709028] dark:text-[#A0CD39]">
                              {senderName}
                              {senderRole ? ` · ${senderRole}` : ''}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {fmtTime(m.createdAt, isAr)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                            {m.body || ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
