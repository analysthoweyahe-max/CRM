import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import type { Event } from 'stream-chat';
import { useQueryClient } from '@tanstack/react-query';
import { streamClient, getStreamToken } from '@/shared/lib/stream';
import { useAuth }               from '@/modules/auth/context/AuthContext';
import { useLang }               from '@/app/providers/LanguageProvider';
import { ConversationList }      from '../components/ConversationList';
import { ChatWindow }            from '../components/ChatWindow';
import { NewConversationModal }  from '../components/NewConversationModal';
import { messagesApi }           from '../api/messages.api';
import { useConversations, useCreateConversation } from '../hooks/useMessages';
import type { StreamChannel, ApiConversation } from '../types/messages.types';

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9@_-]/g, '_');
}

export function MessagesPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const qc       = useQueryClient();
  const isAr     = lang === 'ar';

  const [streamReady,   setStreamReady]   = useState(false);
  const [streamError,   setStreamError]   = useState('');
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [activeConvId,  setActiveConvId]  = useState<string | null>(null);
  const [showModal,     setShowModal]     = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const uidRef = useRef('');

  const { data: convData, isLoading } = useConversations({ per_page: 15 });
  const conversations = convData?.data ?? [];

  const { mutateAsync: createConversation, isPending: creating } = useCreateConversation();

  // Connect Stream for real-time events; sidebar data now comes from REST
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      try {
        if (!streamClient.userID) {
          let uid: string;
          let token: string;
          try {
            const res = await messagesApi.getChatToken();
            uid   = res.data.user_id;
            token = res.data.token;
          } catch {
            uid   = sanitizeId(user.id);
            token = await getStreamToken(uid);
          }
          uidRef.current = uid;
          await streamClient.connectUser({ id: uid, name: user.fullName }, token);
        } else {
          uidRef.current = streamClient.userID;
        }
        if (mounted) setStreamReady(true);
      } catch (e) {
        console.error('[Stream]', e);
        if (mounted) setStreamError(String(e));
      }
    })();

    // Real-time: new message → refresh conversation list
    const onMsg = (e: Event) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      // Also bump unread if the active channel received a message from someone else
      if (e.channel_id && e.user?.id !== uidRef.current) {
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }
    };
    streamClient.on('message.new', onMsg);

    return () => {
      mounted = false;
      streamClient.off('message.new', onMsg);
      const uid = uidRef.current;
      if (streamClient.userID === uid) streamClient.disconnectUser().catch(() => {});
    };
  }, [user, qc]);

  // Open a conversation: watch its Stream channel for real-time messaging
  const handleSelectConversation = useCallback(async (conv: ApiConversation) => {
    setActiveConvId(conv.id);
    setSidebarOpen(false);
    try {
      const channelId = conv.stream_channel_id ?? conv.id;
      const ch = streamClient.channel('messaging', channelId);
      await ch.watch();
      setActiveChannel(ch as StreamChannel);
    } catch (e) {
      console.error('[Stream] watch channel:', e);
    }
  }, []);

  const handleStartConversation = useCallback(
    async (empId: string, empName: string) => {
      const uid = uidRef.current;
      if (!uid || creating) return;
      try {
        let channelId: string;
        try {
          const conv = await createConversation(empId);
          channelId = conv.data.data.stream_channel_id
            ?? [uid, empId.replace(/[^a-zA-Z0-9@_-]/g, '_')].sort().join('--').replace(/[^a-zA-Z0-9_-]/g, '_');
          setActiveConvId(conv.data.data.id);
        } catch {
          channelId = [uid, empId.replace(/[^a-zA-Z0-9@_-]/g, '_')].sort().join('--').replace(/[^a-zA-Z0-9_-]/g, '_');
        }

        const ch = streamClient.channel('messaging', channelId, {
          created_by_id:  uid,
          members:        [uid],
          recipient_name: empName,
          recipient_id:   empId,
        });
        await ch.watch();
        setActiveChannel(ch as StreamChannel);
        setShowModal(false);
        setSidebarOpen(false);
      } catch (e) {
        console.error('[Stream] create channel:', e);
      }
    },
    [creating, createConversation],
  );

  const hiddenTranslate = isAr ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">

        {/* Chat area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {streamError ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
              <p className="text-sm font-medium text-red-500">Stream Connection Error</p>
              <p className="text-xs text-gray-400 break-all">{streamError}</p>
            </div>
          ) : activeChannel ? (
            <ChatWindow
              channel={activeChannel}
              currentUserId={uidRef.current}
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
            activeConvId={activeConvId}
            currentUserId={user?.id ?? uidRef.current}
            loading={isLoading && !streamReady}
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
