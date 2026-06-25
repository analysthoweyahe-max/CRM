import { LEAVE_STATUS_CFG } from '../types/leaves.types';
import type { LeaveStatus } from '../types/leaves.types';

interface Props {
  status: LeaveStatus;
  isAr:   boolean;
}

export function LeaveStatusBadge({ status, isAr }: Props) {
  const cfg = LEAVE_STATUS_CFG[status] ?? LEAVE_STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bgCls} ${cfg.textCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      {isAr ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}
