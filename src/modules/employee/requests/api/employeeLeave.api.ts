import type {
  EmpLeaveTypesResponse,
  EmpLeaveListResponse,
  EmpLeaveSummaryResponse,
  EmpLeaveCreateResponse,
} from '../types/employeeLeave.types';

/* ── dummy delay ── */
function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

/* ── mock store (in-memory, resets on page refresh) ── */
const mockRequests: EmpLeaveListResponse['data']['data'] = [
  {
    id:              '1',
    type:            { id: '2', name: 'إذن' },
    description:     'إذن انصراف مبكر',
    date:            '2026-06-19',
    status:          'approved',
    manager_comment: 'موافق',
  },
  {
    id:          '2',
    type:        { id: '1', name: 'إجازة سنوية' },
    description: 'إجازة عطلة نهاية السنة',
    date:        '2026-07-01',
    status:      'pending',
  },
  {
    id:              '3',
    type:            { id: '3', name: 'إجازة مرضية' },
    description:     'مراجعة طبية',
    date:            '2026-06-10',
    status:          'rejected',
    manager_comment: 'الجدول مليء',
  },
];

let nextId = 4;

export const empLeaveApi = {
  summary() {
    return delay<EmpLeaveSummaryResponse>({
      status: 'success',
      data: [
        { type: 'annual', label: 'إجازة سنوية',  balance: 21, used: 12, remaining: 9  },
        { type: 'sick',   label: 'إجازة مرضية',  balance: 14, used: 4,  remaining: 10 },
      ],
    });
  },

  types() {
    return delay<EmpLeaveTypesResponse>({
      status: 'success',
      data: [
        { id: '1', name: 'إجازة سنوية'  },
        { id: '2', name: 'إذن'           },
        { id: '3', name: 'إجازة مرضية'  },
        { id: '4', name: 'إجازة طارئة'  },
      ],
    });
  },

  list() {
    return delay<EmpLeaveListResponse>({
      status: 'success',
      data:   { data: [...mockRequests] },
    });
  },

  history() {
    return delay<EmpLeaveListResponse>({
      status: 'success',
      data:   { data: [...mockRequests] },
    });
  },

  create(fd: FormData) {
    const typeId      = fd.get('type_id') as string;
    const description = fd.get('description') as string | null;
    const date        = fd.get('date') as string | null;

    const typeMap: Record<string, string> = {
      '1': 'إجازة سنوية',
      '2': 'إذن',
      '3': 'إجازة مرضية',
      '4': 'إجازة طارئة',
    };

    const newReq = {
      id:          String(nextId++),
      type:        { id: typeId, name: typeMap[typeId] ?? 'طلب' },
      description: description ?? undefined,
      date:        date ?? new Date().toISOString().split('T')[0],
      status:      'pending' as const,
    };

    mockRequests.unshift(newReq);

    return delay<EmpLeaveCreateResponse>({
      status:  'success',
      message: 'تم تقديم الطلب بنجاح',
      data:    newReq,
    }, 600);
  },

  show(uuid: string) {
    const item = mockRequests.find(r => r.id === uuid);
    return delay({ status: 'success', data: item ?? null });
  },
};
