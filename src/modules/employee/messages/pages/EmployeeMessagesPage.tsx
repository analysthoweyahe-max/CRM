import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { EmpConversationList } from '../components/EmpConversationList';
import { EmpChatWindow }       from '../components/EmpChatWindow';
import { useEmpConversations } from '../hooks/useEmployeeMessages';
import type { EmpConversation } from '../types/messages.types';

export function EmployeeMessagesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [searchParams] = useSearchParams();
  const [activeConv, setActiveConv] = useState<EmpConversation | null>(null);

  const { data: conversations = [], isLoading } = useEmpConversations();

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (!convId || activeConv?.id === convId) return;
    const found = conversations.find(c => c.id === convId);
    if (found) setActiveConv(found);
  }, [searchParams, conversations, activeConv?.id]);

  return (
    /* negative margin removes the layout's p-4/p-6; fixed height = viewport - topbar */
    <div className="-m-4 md:-m-6 h-[calc(100vh-4rem)] flex overflow-hidden
                    bg-white dark:bg-gray-900 rounded-none">

      {/* ── Chat window (takes remaining space) ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {activeConv ? (
          <EmpChatWindow conversation={activeConv} isAr={isAr} />
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
                {isAr ? 'رسائلك مع المشاريع والفريق' : 'Your project and team messages'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Conversation list (right panel in RTL) ── */}
      <div className="w-72 shrink-0 flex flex-col">
        <EmpConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          loading={isLoading}
          isAr={isAr}
          onSelect={conv => setActiveConv(conv)}
        />
      </div>
    </div>
  );
}
