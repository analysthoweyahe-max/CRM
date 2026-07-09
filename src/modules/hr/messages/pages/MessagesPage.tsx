import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth }               from '@/modules/auth/context/AuthContext';
import { useLang }               from '@/app/providers/LanguageProvider';
import { ConversationList }      from '../components/ConversationList';
import { ChatWindow }            from '../components/ChatWindow';
import { NewConversationModal }  from '../components/NewConversationModal';
import { useConversations, useCreateConversation } from '../hooks/useMessages';
import type { ApiConversation } from '../types/messages.types';
import { normalizeApiConversation } from '../utils/message.utils';

export function MessagesPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [searchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState<ApiConversation | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: convData, isLoading } = useConversations({ per_page: 15 });
  const conversations = convData ?? [];

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (!convId || activeConversation?.id === convId) return;
    const found = conversations.find(c => c.id === convId);
    if (found) setActiveConversation(found);
  }, [searchParams, conversations, activeConversation?.id]);

  const { mutateAsync: createConversation, isPending: creating } = useCreateConversation();

  const handleSelectConversation = useCallback((conv: ApiConversation) => {
    setActiveConversation(conv);
    setSidebarOpen(false);
  }, []);

  const handleStartConversation = useCallback(async (empId: string) => {
    if (creating) return;
    try {
      const res = await createConversation(empId);
      setActiveConversation(normalizeApiConversation(res.data.data));
      setShowModal(false);
      setSidebarOpen(false);
    } catch (e) {
      console.error('[Messages] create conversation:', e);
    }
  }, [creating, createConversation]);

  const hiddenTranslate = isAr ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">

        {/* Chat area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              currentUserId={user?.id ?? ''}
              isAr={isAr}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <MessageSquare size={48} className="opacity-20" />
              <p className="text-sm">
                {isAr ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
              </p>
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

        {/* Sidebar */}
        <div className={`
          absolute inset-y-0 inset-e-0 z-50 flex w-72 flex-col
          bg-white dark:bg-gray-900
          border-s border-gray-100 dark:border-gray-700/60
          shadow-2xl
          transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:z-auto md:w-80 md:shadow-none md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : hiddenTranslate}
        `}>
          <ConversationList
            conversations={conversations}
            activeConvId={activeConversation?.id ?? null}
            currentUserId={user?.id ?? ''}
            loading={isLoading}
            isAr={isAr}
            onSelect={handleSelectConversation}
            onNew={() => setShowModal(true)}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {showModal && (
        <NewConversationModal
          isAr={isAr}
          loading={creating}
          onSelect={handleStartConversation}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
