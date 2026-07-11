import { useState }     from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Paperclip, Plus, Send, Calendar, CheckCircle2, MessageSquare,
} from 'lucide-react';
import { Avatar }   from '@/shared/components/ui/Avatar';
import { Button }   from '@/shared/components/ui/Button';
import { Modal }    from '@/shared/components/ui/Modal';

/* ── Types ────────────────────────────────────────────────────────────── */
interface ClientMessage {
  id:            number;
  senderName:    string;
  senderInitial: string;
  senderColor:   string;
  text:          string;
  sentAt:        string;
  isOwn:         boolean;
}

interface ClientMilestone {
  id:            number;
  title:         string;
  status:        'pending' | 'in_review' | 'approved' | 'rejected';
  statusLabel:   string;
  description?:  string;
  deliveryDate?: string;
  approvedAt?:   string;
  attachments:   { id: number; name: string }[];
  messages:      ClientMessage[];
}

/* ── Dummy data ───────────────────────────────────────────────────────── */
const INITIAL_MILESTONES: ClientMilestone[] = [
  {
    id: 1,
    title: 'تحليل المتطلبات',
    status: 'approved',
    statusLabel: 'تمت الموافقة',
    description: 'جمع وتوثيق متطلبات العمل وإعداد وثيقة BRD النهائية.',
    deliveryDate: '١٠ مايو ٢٠٢٦',
    approvedAt: 'وافق العميل ١١ مايو ٢٠٢٦',
    attachments: [{ id: 1, name: 'وثيقة المتطلبات BRD v1' }],
    messages: [
      {
        id: 1,
        senderName: 'فهد العتيبي',
        senderInitial: 'ف',
        senderColor: 'bg-sky-500',
        text: 'الوثيقة شاملة وواضحة. تمت الموافقة.',
        sentAt: '١١ مايو ٢٠٢٦',
        isOwn: false,
      },
    ],
  },
  {
    id: 2,
    title: 'تصميم الهوية البصرية',
    status: 'approved',
    statusLabel: 'تمت الموافقة',
    deliveryDate: '١٠ مايو ٢٠٢٦',
    attachments: [],
    messages: [],
  },
  {
    id: 3,
    title: 'تصميم واجهات المستخدم',
    status: 'approved',
    statusLabel: 'تمت الموافقة',
    deliveryDate: '١٠ مايو ٢٠٢٦',
    attachments: [],
    messages: [],
  },
  {
    id: 4,
    title: 'تطوير الواجهة الأمامية',
    status: 'in_review',
    statusLabel: 'قيد المراجعة',
    description: 'تطوير صفحات الموقع وتكاملها مع الـ API.',
    deliveryDate: '١ يونيو ٢٠٢٦',
    attachments: [],
    messages: [],
  },
  {
    id: 5,
    title: 'إطلاق الموقع',
    status: 'pending',
    statusLabel: 'قيد التنفيذ',
    deliveryDate: '١ يوليو ٢٠٢٦',
    attachments: [],
    messages: [],
  },
];

/* ── Status badge styles ─────────────────────────────────────────────── */
const STATUS_CLS: Record<string, string> = {
  approved:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  in_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  pending:   'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/* ── Single milestone accordion card ─────────────────────────────────── */
interface CardProps {
  milestone: ClientMilestone;
  isOpen:    boolean;
  onToggle:  () => void;
  onSend:    (milestoneId: number, text: string) => void;
  isAr:      boolean;
}

function MilestoneCard({ milestone: m, isOpen, onToggle, onSend, isAr }: CardProps) {
  const [draft, setDraft] = useState('');

  function handleSend() {
    const t = draft.trim();
    if (!t) return;
    onSend(m.id, t);
    setDraft('');
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                    bg-white dark:bg-gray-800 overflow-hidden shadow-sm">

      {/* ── Accordion header ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4
                   hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
      >
        {/* Start (right in RTL): title */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {m.title}
          {isAr
            ? <ChevronRight size={14} className="text-gray-400 shrink-0" />
            : <ChevronLeft size={14} className="text-gray-400 shrink-0" />}
        </div>

        {/* End (left in RTL): status badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                           ${STATUS_CLS[m.status] ?? STATUS_CLS.pending}`}>
            {m.statusLabel}
          </span>
          {isOpen
            ? <ChevronUp   size={15} className="text-gray-400" />
            : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {/* Collapsed subtitle: delivery date */}
      {!isOpen && m.deliveryDate && (
        <p className="px-5 pb-3 text-xs text-gray-400 dark:text-gray-500 text-start">
          {isAr ? 'موعد التسليم:' : 'Due:'} {m.deliveryDate}
        </p>
      )}

      {/* ── Expanded body ── */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 pb-5 pt-4 space-y-4">

          {/* Description */}
          {m.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 text-start leading-relaxed">
              {m.description}
            </p>
          )}

          {/* Dates row */}
          <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-1.5">
            {m.deliveryDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={13} className="text-gray-400" />
                <span>{m.deliveryDate}</span>
              </div>
            )}
            {m.approvedAt && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span>{m.approvedAt}</span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {m.attachments.length > 0 && (
            <div className="flex flex-col items-start gap-1.5">
              {m.attachments.map(att => (
                <button
                  key={att.id}
                  type="button"
                  className="flex items-center gap-2 text-xs text-[#709028] dark:text-[#A0CD39]
                             hover:underline"
                >
                  <Paperclip size={13} />
                  <span>{att.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Client discussion ── */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

            {/* Section header */}
            <div className="flex items-center justify-start gap-2 px-4 py-2.5
                            bg-gray-50 dark:bg-gray-700/40
                            border-b border-gray-100 dark:border-gray-700">
              <MessageSquare size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {isAr ? 'النقاش مع العميل' : 'Client Discussion'}
              </span>
            </div>

            {/* Messages */}
            <div className="px-4 py-3 space-y-3 bg-gray-50/60 dark:bg-gray-900/20
                            min-h-[60px] max-h-56 overflow-y-auto">
              {m.messages.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                  {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
                </p>
              ) : (
                m.messages.map(msg =>
                  msg.isOwn ? (
                    <div key={msg.id} className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400">{msg.senderName}  {msg.sentAt}</span>
                      <div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-se-sm
                                      bg-[#A0CD39] text-white text-sm leading-relaxed shadow-sm text-start">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <Avatar
                        initial={msg.senderInitial}
                        color={msg.senderColor}
                        size="sm"
                      />
                      <div className="space-y-0.5 text-start">
                        <span className="text-[10px] text-gray-400">{msg.senderName}  {msg.sentAt}</span>
                        <div className="max-w-[70%] px-3.5 py-2 rounded-2xl rounded-ss-sm
                                        bg-white dark:bg-gray-700
                                        border border-gray-100 dark:border-gray-600
                                        text-sm text-gray-800 dark:text-gray-200
                                        leading-relaxed shadow-sm">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* Message input */}
            <div className="flex items-center gap-2 px-3 py-2.5
                            border-t border-gray-100 dark:border-gray-700
                            bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={handleSend}
                className="w-8 h-8 rounded-full bg-[#A0CD39] hover:bg-[#709028]
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
                           placeholder:text-gray-400 text-start
                           focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
              />

              <button type="button"
                className="text-gray-400 hover:text-[#709028] dark:hover:text-[#A0CD39] transition-colors">
                <Paperclip size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add milestone modal ─────────────────────────────────────────────── */
interface AddModalProps {
  open:       boolean;
  onClose:    () => void;
  onAdd:      (title: string) => void;
  isAr:       boolean;
}

function AddMilestoneModal({ open, onClose, onAdd, isAr }: AddModalProps) {
  const [title, setTitle] = useState('');

  function handleSubmit() {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة مرحلة جديدة' : 'Add New Milestone'}
    >
      <div className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-start">
            {isAr ? 'اسم المرحلة' : 'Milestone Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={isAr ? 'مثال: تطوير الواجهة الأمامية' : 'e.g. Frontend Development'}
            autoFocus
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       px-4 py-2.5 text-sm placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#A0CD39] text-start"
          />
        </div>

        <div className="flex justify-start gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!title.trim()} onClick={handleSubmit}>
            {isAr ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Main tab ─────────────────────────────────────────────────────────── */
interface Props {
  isAr: boolean;
}

export function SeoClientUpdatesTab({ isAr }: Props) {
  const [milestones, setMilestones] = useState<ClientMilestone[]>(INITIAL_MILESTONES);
  const [openIds,    setOpenIds]    = useState<Set<number>>(new Set([1]));
  const [showAdd,    setShowAdd]    = useState(false);

  function toggleOpen(id: number) {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd(title: string) {
    const newId = Math.max(0, ...milestones.map(m => m.id)) + 1;
    setMilestones(prev => [
      ...prev,
      {
        id:          newId,
        title,
        status:      'pending',
        statusLabel: isAr ? 'قيد التنفيذ' : 'In Progress',
        attachments: [],
        messages:    [],
      },
    ]);
    setOpenIds(prev => new Set([...prev, newId]));
  }

  function handleSend(milestoneId: number, text: string) {
    setMilestones(prev =>
      prev.map(m =>
        m.id !== milestoneId
          ? m
          : {
              ...m,
              messages: [
                ...m.messages,
                {
                  id:            Date.now(),
                  senderName:    isAr ? 'أنت' : 'You',
                  senderInitial: 'أ',
                  senderColor:   'bg-[#A0CD39]',
                  text,
                  sentAt:        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                  isOwn:         true,
                },
              ],
            }
      )
    );
  }

  return (
    <div className="space-y-4 pb-10">

      {/* Add button */}
      <div className="flex justify-start">
        <Button
          variant="primary"
          startIcon={<Plus size={16} />}
          onClick={() => setShowAdd(true)}
        >
          {isAr ? 'إضافة مرحلة' : 'Add Milestone'}
        </Button>
      </div>

      {/* Milestone list */}
      {milestones.map(m => (
        <MilestoneCard
          key={m.id}
          milestone={m}
          isOpen={openIds.has(m.id)}
          onToggle={() => toggleOpen(m.id)}
          onSend={handleSend}
          isAr={isAr}
        />
      ))}

      {/* Add modal */}
      <AddMilestoneModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
        isAr={isAr}
      />
    </div>
  );
}
