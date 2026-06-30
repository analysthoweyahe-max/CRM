import { useState }  from 'react';
import { toast }     from 'sonner';
import type { RequestItem, FilterKey } from '@/shared/modules/team-reports/types/teamReport.types';

const MOCK: RequestItem[] = [
  {
    id: '1',
    memberName: 'سارة خليل', memberInitial: 'س', memberColor: 'bg-emerald-500',
    typeAr: 'إجازة', typeEn: 'Leave',
    bodyAr: 'إجازة سنوية لمدة يومين', bodyEn: 'Annual leave for 2 days',
    targetDate: '25 يونيو 2026', submittedDate: '20 يونيو 2026',
    status: 'pending',
  },
  {
    id: '2',
    memberName: 'محمد علي', memberInitial: 'م', memberColor: 'bg-purple-500',
    typeAr: 'إذن', typeEn: 'Permit',
    bodyAr: 'إذن انصراف مبكر', bodyEn: 'Early departure permit',
    targetDate: '19 يونيو 2026', submittedDate: '19 يونيو 2026',
    status: 'approved', comment: 'موافق',
  },
  {
    id: '3',
    memberName: 'يوسف حسن', memberInitial: 'ي', memberColor: 'bg-sky-500',
    typeAr: 'طلب دعم', typeEn: 'Support',
    bodyAr: 'طلب ترخيص أداة تطوير', bodyEn: 'Development tool license request',
    targetDate: '17 يونيو 2026', submittedDate: '17 يونيو 2026',
    status: 'rejected', comment: 'غير متاح حالياً',
  },
  {
    id: '4',
    memberName: 'سارة خليل', memberInitial: 'س', memberColor: 'bg-emerald-500',
    typeAr: 'إجازة', typeEn: 'Leave',
    bodyAr: 'إجازة مرضية ليوم واحد', bodyEn: 'Sick leave for 1 day',
    targetDate: '28 يونيو 2026', submittedDate: '27 يونيو 2026',
    status: 'pending',
  },
];

export function useSeoRequests(isAr: boolean) {
  const [items,  setItems]  = useState<RequestItem[]>(MOCK);
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = filter === 'all' ? items : items.filter(r => r.status === filter);

  function approve(id: string) {
    setItems(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved', comment: isAr ? 'موافق' : 'Approved' } : r
    ));
    toast.success(isAr ? 'تمت الموافقة على الطلب' : 'Request approved');
  }

  function reject(id: string) {
    setItems(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected', comment: isAr ? 'مرفوض' : 'Rejected' } : r
    ));
    toast.success(isAr ? 'تم رفض الطلب' : 'Request rejected');
  }

  return { visible, filter, setFilter, approve, reject };
}
