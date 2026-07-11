import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { EmpConversationList } from '../components/EmpConversationList';
import { EmpChatWindow }       from '../components/EmpChatWindow';
import { useEmpConversations } from '../hooks/useEmployeeMessages';
import type { EmpConversation } from '../types/messages.types';

export function EmployeeMessagesPage() {
  const { lang, isRTL } = useLang();
  const isAr     = lang === 'ar';

  const [searchParams] = useSearchParams();
  const [activeConv, setActiveConv] = useState<EmpConversation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: conversations = [], isLoading } = useEmpConversations();

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (!convId || activeConv?.id === convId) return;
    const found = conversations.find(c => c.id === convId);
    if (found) setActiveConv(found);
  }, [searchParams, conversations, activeConv?.id]);

  const hiddenTranslate = isRTL ? '-translate-x-full' : 'translate-x-full';

  return (
    /* negative margin removes the layout's p-4/p-6; fixed height = viewport - topbar */
    <div className="relative -m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                    bg-white dark:bg-gray-900 rounded-none">

      {/* ── Chat window (takes remaining space) ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {activeConv ? (
          <EmpChatWindow
            conversation={activeConv}
            isAr={isAr}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 select-none">
            <div className="w-16 h-16 rounded-full bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10
                            flex items-center justify-center">
              <MessageSquare size={28} className="text-[#A0CD39]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isAr ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isAr ? 'تذاكر الدعم مع الموارد البشرية' : 'HR support tickets'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mt-1 px-4 py-2 rounded-lg bg-[#A0CD39]
                         text-white text-sm font-medium hover:bg-[#709028] transition-colors"
            >
              {isAr ? 'عرض المحادثات' : 'View Conversations'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Conversation list (right panel in RTL) ── */}
      <div className={`
        absolute inset-y-0 inset-e-0 z-50 flex w-72 flex-col
        bg-white dark:bg-gray-900
        shadow-2xl
        transition-transform duration-300 ease-in-out
        md:relative md:inset-auto md:z-auto md:w-80 md:shadow-none md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : hiddenTranslate}
      `}>
        <EmpConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          loading={isLoading}
          isAr={isAr}
          onSelect={conv => { setActiveConv(conv); setSidebarOpen(false); }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
