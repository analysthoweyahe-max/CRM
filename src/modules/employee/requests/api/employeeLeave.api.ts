import { http } from '@/shared/services/http.service';
import type {
  EmpLeaveTypesResponse,
  EmpLeaveListResponse,
  EmpLeaveSummaryResponse,
  EmpLeaveCreateResponse,
  EmpLeaveRequest,
} from '../types/employeeLeave.types';

/* ── Raw backend shapes ──────────────────────────────────────────────── */
interface RawRequestType { value: string; label: string; }
interface RawRequestTypesResponse { status: string; message: string; data: RawRequestType[]; }

interface RawRequestItem {
  id:               string;
  requestType:      string;
  requestTypeLabel: string;
  title:            string;
  description:      string | null;
  requestDate:      string;
  startDate:        string;
  endDate:          string;
  submittedAt:      string;
  status:           'pending' | 'approved' | 'rejected';
  statusLabel:      string;
  reviewerComment:  string | null;
  reviewedAt:       string | null;
}

interface RawRequestListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawRequestItem[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

interface RawRequestCreateResponse {
  status:  string;
  message: string;
  data:    RawRequestItem;
}

function toLocalRequest(r: RawRequestItem): EmpLeaveRequest {
  return {
    id:              r.id,
    type:            r.requestTypeLabel,
    description:     r.description ?? undefined,
    date:            r.requestDate,
    start_date:      r.startDate,
    end_date:        r.endDate,
    status:          r.status,
    manager_comment: r.reviewerComment ?? undefined,
    created_at:      r.submittedAt,
  };
}

export const empLeaveApi = {
  summary() {
    return http.get<EmpLeaveSummaryResponse>('/v1/employee/leave/summary');
  },

  async types(): Promise<{ data: EmpLeaveTypesResponse }> {
    const res = await http.get<RawRequestTypesResponse>('/v1/employee/leave/lookups/types');
    return {
      data: {
        status: res.data.status,
        data:   res.data.data.map(t => ({ id: t.value, name: t.label })),
      },
    };
  },

  async list(): Promise<{ data: EmpLeaveListResponse }> {
    const res = await http.get<RawRequestListResponse>('/v1/employee/leave', { params: { per_page: 15 } });
    return {
      data: {
        status: res.data.status,
        data:   { data: res.data.data.data.map(toLocalRequest) },
      },
    };
  },

  history() {
    return this.list();
  },

  async create(fd: FormData): Promise<{ data: EmpLeaveCreateResponse }> {
    const typeId      = fd.get('type_id')    as string;
    const typeLabel   = fd.get('type_label') as string | null;
    const description = fd.get('description') as string | null;
    const date        = (fd.get('date') as string | null) || new Date().toISOString().split('T')[0];

    const res = await http.post<RawRequestCreateResponse>('/v1/employee/leave', {
      request_type: typeId,
      title:        description || typeLabel || typeId,
      description:  description || undefined,
      request_date: date,
      start_date:   date,
      end_date:     date,
    });

    return {
      data: {
        status:  res.data.status,
        message: res.data.message,
        data:    toLocalRequest(res.data.data),
      },
    };
  },

  show(uuid: string) {
    return http.get(`/v1/employee/leave/${uuid}`);
  },
};
