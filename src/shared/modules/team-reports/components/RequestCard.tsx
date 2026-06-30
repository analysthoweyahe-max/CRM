import { Check, X }  from 'lucide-react';
import { Avatar }     from '@/shared/components/ui/Avatar';
import type { RequestItem, RequestStatus } from '../types/teamReport.types';

const STATUS_CFG: Record<RequestStatus, { ar: string; en: string; dot: string; text: string }> = {
  pending:  { ar: 'قيد المراجعة', en: 'Under Review', dot: 'bg-amber-400',   text: 'text-amber-600 dark:text-amber-400'    },
  approved: { ar: 'موافق عليه',   en: 'Approved',     dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  rejected: { ar: 'مرفوض',        en: 'Rejected',     dot: 'bg-red-500',     text: 'text-red-500 dark:text-red-400'         },
};

interface Props {
  item:      RequestItem;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  isAr:      boolean;
}

export function RequestCard({ item, onApprove, onReject, isAr }: Props) {
  const s = STATUS_CFG[item.status];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">

      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
          {isAr ? s.ar : s.en}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-600
                           text-gray-500 dark:text-gray-400">
            {isAr ? item.typeAr : item.typeEn}
          </span>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.memberName}</p>
          <Avatar initial={item.memberInitial} color={item.memberColor} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1 text-end">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {isAr ? item.bodyAr : item.bodyEn}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isAr ? 'التاريخ:' : 'Date:'} {item.targetDate}
          &nbsp;·&nbsp;
          {isAr ? 'قُدِّم:' : 'Submitted:'} {item.submittedDate}
        </p>
        {item.comment && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? 'تعليق:' : 'Note:'} {item.comment}
          </p>
        )}
      </div>

      {/* Actions — only for pending */}
      {item.status === 'pending' && (
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onReject(item.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                       bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
          >
            <X size={13} />
            {isAr ? 'رفض' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                       bg-[#A0CD39] hover:bg-[#709028] text-white text-xs font-semibold transition-colors"
          >
            <Check size={13} />
            {isAr ? 'موافقة' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  );
}
