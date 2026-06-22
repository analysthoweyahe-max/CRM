import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import type { Event } from 'stream-chat';
import { streamClient, getStreamToken } from '@/shared/lib/stream';
import { useAuth }               from '@/features/auth/context/AuthContext';
import { useLang }               from '@/app/providers/LanguageProvider';
import { ConversationList }      from '../components/ConversationList';
import { ChatWindow }            from '../components/ChatWindow';
import { NewConversationModal }  from '../components/NewConversationModal';
import type { StreamChannel }    from '../types/messages.types';

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9@_-]/g, '_');
}

export function MessagesPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [loading,       setLoading]       = useState(true);
  const [streamError,   setStreamError]   = useState('');
  const [channels,      setChannels]      = useState<StreamChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [showModal,     setShowModal]     = useState(false);
  const [creating,      setCreating]      = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const uidRef = useRef('');

  useEffect(() => {
    if (!user) return;
    const uid = sanitizeId(user.id);
    uidRef.current = uid;
    let mounted = true;

    (async () => {
      try {
        if (!streamClient.userID) {
          const token = await getStreamToken(uid);
          await streamClient.connectUser({ id: uid, name: user.fullName }, token);
        }
        if (!mounted) return;

        const chs = await streamClient.queryChannels(
          { type: 'messaging', members: { $in: [uid] } },
          { last_message_at: -1 },
          { watch: true, state: true, limit: 30 },
        );
        if (!mounted) return;
        setChannels(chs as StreamChannel[]);
        if (chs.length) setActiveChannel(chs[0] as StreamChannel);
      } catch (e) {
        console.error('[Stream]', e);
        if (mounted) setStreamError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const onMsg = (e: Event) => {
      setChannels(prev => {
        const ch = prev.find(c => c.id === e.channel_id);
        if (!ch) return prev;
        return [ch, ...prev.filter(c => c.id !== e.channel_id)];
      });
    };
    streamClient.on('message.new', onMsg);

    return () => {
      mounted = false;
      streamClient.off('message.new', onMsg);
      if (streamClient.userID === uid) {
        streamClient.disconnectUser().catch(() => {});
      }
    };
  }, [user]);

  const handleSelectChannel = useCallback((ch: StreamChannel) => {
    setActiveChannel(ch);
    setSidebarOpen(false);
  }, []);

  const handleStartConversation = useCallback(
    async (empId: string, empName: string) => {
      const uid = uidRef.current;
      if (!uid || creating) return;
      setCreating(true);
      try {
        const channelId = [uid, empId].sort().join('--').replace(/[^a-zA-Z0-9_-]/g, '_');
        const ch = streamClient.channel('messaging', channelId, {
          created_by_id:  uid,
          members:        [uid],
          recipient_name: empName,
          recipient_id:   empId,
        });
        await ch.watch();
        const typed = ch as StreamChannel;
        setChannels(prev =>
          prev.some(c => c.cid === typed.cid) ? prev : [typed, ...prev],
        );
        setActiveChannel(typed);
        setShowModal(false);
        setSidebarOpen(false);
      } catch (e) {
        console.error('[Stream] create channel:', e);
      } finally {
        setCreating(false);
      }
    },
    [creating],
  );

  // Sidebar slides from the inline-end side: RTL → left (negative X), LTR → right (positive X)
  const hiddenTranslate = isAr ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">

        {/* ── Chat area — full-width on mobile, flex-1 on desktop */}
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

        {/* ── Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar
              Mobile  : absolute drawer from the end side, z-50
              Desktop : in-flow flex panel, w-80, always visible */}
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
            channels={channels}
            activeChannel={activeChannel}
            currentUserId={uidRef.current}
            loading={loading}
            isAr={isAr}
            onSelect={handleSelectChannel}
            onNew={() => setShowModal(true)}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {showModal && (
        <NewConversationModal
          isAr={isAr}
          currentUserId={uidRef.current}
          loading={creating}
          onSelect={handleStartConversation}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
