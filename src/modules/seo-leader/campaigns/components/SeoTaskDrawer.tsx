import { useState }              from 'react';
import { X }                    from 'lucide-react';
import { useNavigate }           from 'react-router-dom';
import { useSeoTaskDrawer }      from './useSeoTaskDrawer';
import { SeoTaskInfoTab }        from './SeoTaskInfoTab';
import { SeoAttachmentsTab }     from './SeoAttachmentsTab';
import { SeoEditTaskModal }      from './SeoEditTaskModal';
import { ExtendDeadlineModal }   from '@/shared/components/form/ExtendDeadlineModal';
import { TaskTimeTab }           from '@/modules/project-manager/tasks/components/TaskTimeTab';
import { TaskCommentsTab }       from '@/modules/project-manager/tasks/components/TaskCommentsTab';
import { useCreateSeoConversation } from '@/modules/seo-member/messages/hooks/useSeoMessages';
import { usePermission }         from '@/shared/hooks/usePermission';
import { ROUTES }                from '@/app/router/routes';
import type { MentionRef, ResolvedMention } from '@/shared/components/chat';
import type { SeoDrawerTab }     from './SeoTaskModal.types';

/* ── Tabs config ─────────────────────────────────────────────────────── */
const TABS: { key: SeoDrawerTab; ar: string }[] = [
  { key: 'info',        ar: 'المعلومات'  },
  { key: 'time',        ar: 'تتبع الوقت' },
  { key: 'attachments', ar: 'المرفقات'   },
  { key: 'comments',    ar: 'التعليقات'  },
];

/* ── Skeleton ────────────────────────────────────────────────────────── */
function DrawerSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-4 animate-pulse overflow-y-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700 ms-auto" />
          <div className="h-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────────────────── */
interface Props {
  taskId:    string | null;
  projectId: string;
  onClose:   () => void;
  isAr:      boolean;
}

/* ── Component ───────────────────────────────────────────────────────── */
export function SeoTaskDrawer({ taskId, projectId, onClose, isAr }: Props) {
  const d = useSeoTaskDrawer(projectId, taskId, isAr);
  const navigate = useNavigate();
  const { mutateAsync: createConversation } = useCreateSeoConversation(isAr);
  const canEdit = usePermission('edit-seo-tasks');

  const [editOpen, setEditOpen] = useState(false);

  if (!taskId) return null;

  function getMentionInfo(ref: MentionRef): ResolvedMention | undefined {
    const m = d.mentionables.find(x => x.id === ref.id && (x.type ?? 'employee') === ref.type);
    return m ? { id: m.id, type: m.type ?? 'employee', name: m.name } : undefined;
  }

  async function handleMentionStartChat(ref: MentionRef) {
    try {
      const conv = await createConversation({ recipient_type: ref.type, recipient_id: ref.id });
      navigate(`${ROUTES.SEO_LEADER.MESSAGES}?conversation=${conv.id}`);
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={[
          'fixed inset-y-0 z-50 flex flex-col w-full max-w-xl',
          'bg-white dark:bg-gray-800 shadow-2xl',
          isAr ? 'left-0' : 'right-0',
        ].join(' ')}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="min-w-0 text-end">
            {d.isLoading ? (
              <div className="h-5 w-48 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            ) : (
              <>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-1">
                  {d.task?.title ?? '—'}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  #{d.task?.taskNumber ?? d.task?.id}
                  {d.task?.taskTypeLabel && (
                    <span className="ms-2 text-[#709028] dark:text-[#A0CD39]">
                      {d.task.taskTypeLabel}
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 px-4 pt-3 shrink-0 border-b border-gray-100 dark:border-gray-700">
          {TABS.map(t => {
            const count = t.key === 'attachments'
              ? d.attachmentsCount
              : t.key === 'comments'
                ? d.comments.length
                : undefined;
            return (
            <button
              key={t.key}
              type="button"
              onClick={() => d.setTab(t.key)}
              className={[
                'pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors',
                d.tab === t.key
                  ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              ].join(' ')}
            >
              {t.ar}{count != null && count > 0 ? ` (${count})` : ''}
            </button>
            );
          })}
        </div>

        {/* ── Tab body ────────────────────────────────────────────────── */}
        {d.isLoading ? (
          <DrawerSkeleton />
        ) : !d.task ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'تعذّر تحميل المهمة' : 'Failed to load task'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Info */}
            {d.tab === 'info' && (
              <SeoTaskInfoTab
                task={d.task}
                isAr={isAr}
                description={d.description}             setDescription={d.setDescription}
                taskType={d.taskType}                   setTaskType={d.setTaskType}
                priority={d.priority}                   setPriority={d.setPriority}
                status={d.status}                       setStatus={d.setStatus}
                startDate={d.startDate}                 setStartDate={d.setStartDate}
                dueDate={d.dueDate}                     setDueDate={d.setDueDate}
                targetUrl={d.targetUrl}                 setTargetUrl={d.setTargetUrl}
                targetKeyword={d.targetKeyword}         setTargetKeyword={d.setTargetKeyword}
                searchIntent={d.searchIntent}           setSearchIntent={d.setSearchIntent}
                searchVolume={d.searchVolume}           setSearchVolume={d.setSearchVolume}
                keywordDifficulty={d.keywordDifficulty} setKeywordDifficulty={d.setKeywordDifficulty}
                metaTitle={d.metaTitle}                 setMetaTitle={d.setMetaTitle}
                metaDescription={d.metaDescription}    setMetaDescription={d.setMetaDescription}
                siteLinks={d.siteLinks}                 setSiteLinks={d.setSiteLinks}
                referenceLinks={d.referenceLinks}       setReferenceLinks={d.setReferenceLinks}
                notes={d.notes}                         setNotes={d.setNotes}
                isSaving={false}
                onEdit={() => setEditOpen(true)}
                onDelete={() => d.setDeleteOpen(true)}
                onExtend={() => d.setExtendOpen(true)}
                canEdit={canEdit}
                assigneeItems={d.assigneeItems}
                assigneeId={d.assigneeId}               setAssigneeId={d.setAssigneeId}
              />
            )}

            {/* Time tracking */}
            {d.tab === 'time' && (
              <TaskTimeTab
                sessions={d.sessions}
                totalHours={d.totalHours}
                estimatedHours={d.estimatedHours}
                remainingHours={d.remainingHours}
                progress={d.progress}
                onAddTimeLog={canEdit ? d.addTimeLog : undefined}
                loggingTime={d.loggingTime}
                isAr={isAr}
                timer={{ portal: 'seo', projectId, taskId: taskId!, title: d.task.title }}
              />
            )}

            {/* Attachments */}
            {d.tab === 'attachments' && (
              <SeoAttachmentsTab
                attachments={d.attachments}
                onUploadFiles={canEdit ? d.uploadFiles : undefined}
                onDelete={canEdit ? d.deleteAttachment : undefined}
                isUploading={d.isUploading}
                deletingId={d.deletingId}
                isAr={isAr}
              />
            )}

            {/* Comments */}
            {d.tab === 'comments' && (
              <TaskCommentsTab
                comments={d.comments}
                text={d.commentText}
                setText={d.setCommentText}
                onSubmit={d.addComment}
                onEdit={d.updateComment}
                mentionables={d.mentionables.map(m => ({
                  id: m.id,
                  name: m.name,
                  type: m.type ?? 'employee',
                }))}
                isAr={isAr}
                getMentionInfo={getMentionInfo}
                onMentionStartChat={handleMentionStartChat}
              />
            )}

          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {canEdit && editOpen && d.task && (
        <SeoEditTaskModal
          task={d.task}
          projectId={projectId}
          isAr={isAr}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* Extend Deadline Modal */}
      {canEdit && (
        <ExtendDeadlineModal
          open={d.extendOpen}
          onClose={() => d.setExtendOpen(false)}
          onSubmit={d.extendDeadline}
          isSaving={d.extendingDeadline}
          isAr={isAr}
        />
      )}

      {/* Delete confirm */}
      {canEdit && d.deleteOpen && (
        <>
          <div className="fixed inset-0 z-60 bg-black/40" onClick={() => d.setDeleteOpen(false)} />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isAr ? 'حذف المهمة' : 'Delete Task'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {isAr ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => d.setDeleteOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600
                             text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => { d.setDeleteOpen(false); onClose(); }}
                  className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
