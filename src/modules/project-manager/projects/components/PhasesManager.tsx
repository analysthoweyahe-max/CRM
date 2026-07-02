import { CheckCircle2, Clock, FileText } from 'lucide-react';
import type { PmProjectPhase } from '../types/project.types';

const APPROVAL_DOT: Record<string, string> = {
  pending:  'bg-gray-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

interface Props {
  phases: PmProjectPhase[];
  isAr:   boolean;
}

export function PhasesManager({ phases, isAr }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'مراحل المشروع' : 'Project Phases'}
      </h2>

      {phases.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          {isAr ? 'لا توجد مراحل لهذا المشروع' : 'No phases for this project'}
        </p>
      ) : (
        <ul className="space-y-2">
          {phases.map(phase => (
            <li
              key={phase.uuid}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className={[
                  'inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full shrink-0',
                  phase.approvalStatus === 'approved'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : phase.approvalStatus === 'rejected'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                ].join(' ')}>
                  <span className={`w-1.5 h-1.5 rounded-full ${APPROVAL_DOT[phase.approvalStatus] ?? 'bg-gray-400'}`} />
                  {phase.approvalStatusLabel}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-end truncate">
                  {phase.name}
                </span>
              </div>

              {phase.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-end">{phase.description}</p>
              )}

              <div className="flex items-center gap-3 justify-end text-xs text-gray-400 dark:text-gray-500">
                {phase.deliveryDate && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {phase.deliveryDate}
                  </span>
                )}
                {phase.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {phase.attachments.length}
                  </span>
                )}
                {phase.clientApprovedAt && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 size={12} />
                    {phase.clientApprovedAt}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
