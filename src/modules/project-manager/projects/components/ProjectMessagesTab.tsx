import { AtSign, FileText, Paperclip, Search, Send, UserPlus } from 'lucide-react';
import { Avatar }               from '@/shared/components/ui/Avatar';
import { Button }               from '@/shared/components/ui/Button';
import { MessageBodyText }      from '@/shared/components/chat';
import { useAutoResizeTextarea } from '@/shared/hooks/useAutoResizeTextarea';
import { getPastedImageFile }   from '@/shared/utils/clipboardImage.utils';
import { useProjectMessages }   from '../hooks/useProjectMessages';
import { useProjectTeamTab }    from '../hooks/useProjectTeamTab';
import { AddTeamMemberModal }   from './AddTeamMemberModal';
import type { ChatMessage } from '../types/message.types';

interface Props {
  projectId: string;
  isAr:      boolean;
}

function MessageContent({ msg }: { msg: ChatMessage }) {
  const attachments = msg.attachments ?? [];

  return (
    <>
      {attachments.map(att => (
        att.mimeType.startsWith('image/') && att.url ? (
          <img
            key={att.id}
            src={att.url}
            alt={att.fileName}
            onClick={() => window.open(att.url, '_blank')}
            className="max-w-full max-h-48 rounded-lg object-cover cursor-pointer mb-1"
          />
        ) : (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 mb-1 px-3 py-2 rounded-lg text-xs transition-colors
                        ${msg.isOwn ? 'bg-black/10 hover:bg-black/15' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate max-w-40">{att.fileName}</span>
          </a>
        )
      ))}
      {msg.text && (
        <MessageBodyText
          text={msg.text}
          className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word"
          linkClassName={msg.isOwn
            ? 'underline break-all text-white hover:opacity-80'
            : 'underline break-all text-[#709028] dark:text-[#A0CD39] hover:opacity-80'}
        />
      )}
    </>
  );
}

export function ProjectMessagesTab({ projectId, isAr }: Props) {
  const {
    filtered, text, setText, search, setSearch, send, handleKey, handleFile, bottomRef, fileRef,
    isLoading, canSend, sendError, isSending,
    showMentions, setShowMentions, mentionables, insertMention,
  } = useProjectMessages(projectId);

  const textareaRef = useAutoResizeTextarea(text);

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = getPastedImageFile(e);
    if (!file) return;
    e.preventDefault();
    send(file);
  }

  const {
    showModal, openModal, closeModal,
    available, availableSearch, setAvailableSearch, isLoadingAvailable,
    selectedIds, toggleSelected,
    projectRole, setProjectRole,
    canAdd, handleAddExisting,
  } = useProjectTeamTab(projectId, isAr);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">

      {/* Search + add members */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث في الرسائل...' : 'Search messages...'}
            className="w-full pe-9 ps-4 py-2 text-sm rounded-xl
                       bg-gray-50 dark:bg-gray-700/50
                       border border-gray-100 dark:border-gray-600
                       text-gray-700 dark:text-gray-300
                       placeholder:text-gray-400
                       text-end
                       focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
          />
        </div>
        <Button
          variant="primary"
          startIcon={<UserPlus size={15} />}
          onClick={openModal}
          className="shrink-0 whitespace-nowrap"
        >
          {isAr ? 'إضافة موظفين' : 'Add Members'}
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5
                      min-h-[380px] max-h-[460px]
                      bg-gray-50/70 dark:bg-gray-900/20">
        {isLoading ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
            {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
          </p>
        ) : filtered.map(msg =>
          msg.isOwn ? (
            <div key={msg.id} className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400 dark:text-gray-500 pe-1">
                {msg.senderName}&emsp;{msg.time}
              </span>
              <div className="max-w-[65%] px-4 py-2.5 rounded-2xl rounded-tr-sm
                              bg-[#A0CD39] text-white text-sm leading-relaxed shadow-sm">
                <MessageContent msg={msg} />
              </div>
              {msg.isRead && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 pe-1">
                  {isAr ? 'قرأت ✓✓' : 'Read ✓✓'}
                </span>
              )}
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-2.5">
              <Avatar initial={msg.senderInitial} color={msg.senderColor} size="sm" />
              <div className="space-y-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 ps-1">
                  {msg.senderName}&emsp;{msg.time}
                </span>
                <div className="max-w-[65%] px-4 py-2.5 rounded-2xl rounded-tl-sm
                                bg-white dark:bg-gray-700
                                border border-gray-100 dark:border-gray-600
                                text-sm text-gray-800 dark:text-gray-200
                                leading-relaxed shadow-sm">
                  <MessageContent msg={msg} />
                </div>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {canSend ? (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          {sendError === 'read_only' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 text-end">
              {isAr ? 'عرض فقط — لا يمكنك إرسال رسائل' : 'View only — you cannot send messages'}
            </p>
          )}
          {sendError && sendError !== 'read_only' && (
            <p className="text-xs text-red-500 mb-2 text-end">{sendError}</p>
          )}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => send()}
              disabled={!text.trim() || isSending}
              className="w-9 h-9 rounded-full bg-[#A0CD39] hover:bg-[#709028]
                         flex items-center justify-center shrink-0
                         transition-colors shadow-sm disabled:opacity-50"
            >
              <Send size={15} className="text-white" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              onPaste={handlePaste}
              placeholder={isAr ? 'اكتب رسالة...' : 'Write a message...'}
              className="flex-1 resize-none text-sm rounded-xl
                         bg-gray-50 dark:bg-gray-700/50
                         border border-gray-100 dark:border-gray-600
                         px-3.5 py-2
                         text-gray-700 dark:text-gray-300
                         placeholder:text-gray-400
                         text-end
                         focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50
                         max-h-28 overflow-y-auto"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMentions(o => !o)}
                className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors"
              >
                <AtSign size={17} />
              </button>
              {showMentions && (
                <div className="absolute bottom-full mb-2 end-0 w-56 max-h-56 overflow-y-auto
                                rounded-xl border border-gray-200 dark:border-gray-600
                                bg-white dark:bg-gray-800 shadow-xl z-10 py-1">
                  {mentionables.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-gray-400 text-center">
                      {isAr ? 'لا يوجد أعضاء' : 'No members'}
                    </p>
                  ) : mentionables.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => insertMention(m)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-end
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Avatar initial={m.avatarInitial} color="bg-gray-400" size="sm" />
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isSending}
              className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors disabled:opacity-50"
            >
              <Paperclip size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              onChange={handleFile}
            />
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            {isAr ? 'عرض الرسائل فقط (مشرف عام)' : 'Read-only message view (super-admin)'}
          </p>
        </div>
      )}

      <AddTeamMemberModal
        open={showModal}
        onClose={closeModal}
        isAr={isAr}
        available={available}
        search={availableSearch}
        onSearchChange={setAvailableSearch}
        isLoadingAvailable={isLoadingAvailable}
        selectedIds={selectedIds}
        projectRole={projectRole}
        onToggle={toggleSelected}
        onSetRole={setProjectRole}
        canAdd={canAdd}
        onConfirm={handleAddExisting}
      />

    </div>
  );
}
