import { useRef, useState } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  Paperclip, Send, Calendar, CheckCircle2, MessageSquare, ListChecks,
} from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { getAvatarColor } from '@/shared/utils';
import { usePhaseMessages } from '../hooks/useProjectClientUpdates';
import type { PmClientUpdatePhase } from '../types/clientUpdates.types';

const STATUS_CLS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:  'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface Props {
  projectId: string;
  phase:     PmClientUpdatePhase;
  isOpen:    boolean;
  onToggle:  () => void;
  isAr:      boolean;
}

export function ClientUpdatePhaseCard({ projectId, phase, isOpen, onToggle, isAr }: Props) {
  const { user } = useAuth();
  const { messages, isLoading, send, uploadFile } = usePhaseMessages(projectId, phase.id, isOpen, isAr);

  const [draft, setDraft]       = useState('');
  const [sending, setSending]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await send(text);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                    bg-white dark:bg-gray-800 overflow-hidden shadow-sm">

      {/* Accordion header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4
                   hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                           ${STATUS_CLS[phase.approvalStatus] ?? STATUS_CLS.pending}`}>
            {phase.approvalStatusLabel}
          </span>
          {isOpen
            ? <ChevronUp   size={15} className="text-gray-400" />
            : <ChevronDown size={15} className="text-gray-400" />}
        </div>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {phase.name}
          <ChevronLeft size={14} className="text-gray-400 shrink-0" />
        </div>
      </button>

      {!isOpen && phase.deliveryDate && (
        <p className="px-5 pb-3 text-xs text-gray-400 dark:text-gray-500 text-end">
          {isAr ? 'موعد التسليم:' : 'Due:'} {phase.deliveryDate}
        </p>
      )}

      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 pb-5 pt-4 space-y-4">

          {phase.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 text-end leading-relaxed">
              {phase.description}
            </p>
          )}

          {/* Dates + tasks count row */}
          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>{phase.tasksCount} {isAr ? 'مهمة' : 'tasks'}</span>
              <ListChecks size={13} className="text-gray-400" />
            </div>
            {phase.deliveryDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{phase.deliveryDate}</span>
                <Calendar size={13} className="text-gray-400" />
              </div>
            )}
            {phase.clientApprovedAt && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <span>{phase.clientApprovedAt}</span>
                <CheckCircle2 size={13} />
              </div>
            )}
          </div>

          {/* Attachments */}
          {phase.attachments.length > 0 && (
            <div className="flex flex-col items-end gap-1.5">
              {phase.attachments.map(att => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-[#709028] dark:text-[#A0CD39] hover:underline"
                >
                  <span>{att.name ?? `#${att.id}`}</span>
                  <Paperclip size={13} />
                </a>
              ))}
            </div>
          )}

          {/* Client discussion */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-end gap-2 px-4 py-2.5
                            bg-gray-50 dark:bg-gray-700/40
                            border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {isAr ? 'النقاش مع العميل' : 'Client Discussion'}
              </span>
              <MessageSquare size={14} className="text-gray-400" />
            </div>

            <div className="px-4 py-3 space-y-3 bg-gray-50/60 dark:bg-gray-900/20
                            min-h-[60px] max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                  {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
                </p>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.sender.id === user?.id;
                  return isOwn ? (
                    <div key={msg.id} className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400">{msg.sender.name}  {msg.createdAt}</span>
                      <div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-tr-sm
                                      bg-[#A0CD39] text-white text-sm leading-relaxed shadow-sm">
                        {msg.body}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <Avatar
                        initial={msg.sender.name.charAt(0)}
                        color={getAvatarColor(msg.sender.id)}
                        size="sm"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400">{msg.sender.name}  {msg.createdAt}</span>
                        <div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-tl-sm
                                        bg-white dark:bg-gray-700
                                        border border-gray-100 dark:border-gray-600
                                        text-sm text-gray-800 dark:text-gray-200
                                        leading-relaxed shadow-sm">
                          {msg.body}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message input */}
            <div className="flex items-center gap-2 px-3 py-2.5
                            border-t border-gray-100 dark:border-gray-700
                            bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                className="w-8 h-8 rounded-full bg-[#A0CD39] hover:bg-[#709028] disabled:opacity-50
                           flex items-center justify-center shrink-0 transition-colors"
              >
                <Send size={14} className="text-white" />
              </button>

              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isAr ? 'اكتب رسالة...' : 'Write a message…'}
                className="flex-1 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50
                           border border-gray-100 dark:border-gray-600
                           px-3 py-1.5 text-gray-700 dark:text-gray-300
                           placeholder:text-gray-400 text-end
                           focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
              />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors disabled:opacity-50"
              >
                <Paperclip size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
