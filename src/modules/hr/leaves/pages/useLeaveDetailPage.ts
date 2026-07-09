import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLang }   from '@/app/providers/LanguageProvider';
import { useLeaveDetail, useLeaveApprove, useLeaveReject } from '../hooks/useLeaves';
import { getInitial, getAvatarColor } from '@/modules/hr/employees/types/employee.types';
import { formatLeaveDuration, getLeaveEmployeeName } from '../utils/leave.utils';
import type { UseLeaveDetailPageReturn } from '../types/leaves.types';

export function useLeaveDetailPage(): UseLeaveDetailPageReturn {
  const { id }   = useParams<{ id: string }>();
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [approveOpen,  setApproveOpen]  = useState(false);
  const [rejectOpen,   setRejectOpen]   = useState(false);
  const [approveNote,  setApproveNote]  = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError,  setRejectError]  = useState(false);

  const { data: req, isLoading, isError } = useLeaveDetail(id);
  const approveMutation = useLeaveApprove();
  const rejectMutation  = useLeaveReject();

  const name     = req ? getLeaveEmployeeName(req) : '';
  const initial  = name ? getInitial(name) : '?';
  const avatarBg = name ? getAvatarColor(name) : 'bg-gray-400';
  const daysLabel = req ? formatLeaveDuration(req.days_count, isAr) : '';

  function handleApprove() {
    approveMutation.mutate(
      { id: id!, notes: approveNote || undefined },
      { onSuccess: () => { setApproveOpen(false); setApproveNote(''); } },
    );
  }

  function handleReject() {
    if (!rejectReason.trim()) { setRejectError(true); return; }
    rejectMutation.mutate(
      { id: id!, reason: rejectReason },
      { onSuccess: () => { setRejectOpen(false); setRejectReason(''); setRejectError(false); } },
    );
  }

  return {
    id,
    isAr,
    req,
    isLoading,
    isError,
    name,
    initial,
    avatarBg,
    daysLabel,
    approveOpen,  setApproveOpen,
    rejectOpen,   setRejectOpen,
    approveNote,  setApproveNote,
    rejectReason, setRejectReason,
    rejectError,  setRejectError,
    isActionPending: approveMutation.isPending || rejectMutation.isPending,
    handleApprove,
    handleReject,
  };
}
