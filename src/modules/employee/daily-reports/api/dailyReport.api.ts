import { http } from '@/shared/services/http.service';
import { saveDayDraft, getDayDraft, clearDayDraft } from '../store/dayDraft.store';
import { mapDailyReportHistoryItem } from '@/shared/modules/daily-reports/utils/mapDailyReport';
import type {
  CreateDailyReportPayload,
  RawDailyReportItem as SharedRawDailyReportItem,
} from '@/shared/modules/daily-reports/types/dailyReport.types';
import type {
  DailyReportListResponse, DailyReportCreateResponse,
  HistoryListResponse, PlannedTasksResponse,
  WorkedTasksResponse, WeeklyDataResponse,
  StartDayPayload, EndDayPayload,
} from '../types/dailyReport.types';

function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/* ── Raw backend shapes ──────────────────────────────────────────────── */
interface RawDailyReportTask {
  taskId:       number;
  taskTitle:    string;
  plannedHours: number;
  actualHours:  number;
}

interface RawDailyReportItem {
  id:          string;
  reportDate:  string;
  checkInAt:   string;
  checkOutAt:  string;
  summaryNote: string;
  tasks:       RawDailyReportTask[];
  submittedAt: string;
}

interface RawDailyReportListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawDailyReportItem[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

interface RawDailyReportCreateResponse {
  status:  string;
  message: string;
  data:    RawDailyReportItem;
}

/* ── Still-mock data (no real endpoints given yet) ──────────────────── */
const mockTasks: PlannedTasksResponse['data']['data'] = [
  { id: 't1', name: 'تطوير واجهة المستخدم' },
  { id: 't2', name: 'تطوير شاشة الطلبات'  },
];

const mockWorked: WorkedTasksResponse['data']['data'] = [
  { id: 't1', name: 'تطوير واجهة المستخدم', actualHours: 6.5 },
  { id: 't2', name: 'تطوير شاشة الطلبات',  actualHours: 6.5 },
];

const mockWeekly: WeeklyDataResponse['data']['data'] = [
  { taskId: 't1', taskName: 'تطوير واجهة المستخدم', sat: null, sun: null, mon: null, tue: null, wed: 5.25, thu: 1.25, fri: null, total: 6.5 },
  { taskId: 't2', taskName: 'تطوير شاشة الطلبات',  sat: null, sun: null, mon: null, tue: null, wed: 5.25, thu: 1.25, fri: null, total: 6.5 },
];

const mockReports: DailyReportListResponse['data']['data'] = [
  { id: '1', date: '2026-06-27', title: 'تقرير يوم الجمعة',   description: 'إنهاء تصميم الواجهة', hours_worked: 7,   status: 'approved' },
  { id: '2', date: '2026-06-26', title: 'تقرير يوم الخميس',   description: 'تطوير API',           hours_worked: 8,   status: 'approved' },
  { id: '3', date: '2026-06-25', title: 'تقرير يوم الأربعاء', description: 'مراجعة المتطلبات',    hours_worked: 6,   status: 'submitted' },
];

let nextId = 4;

export const dailyReportApi = {
  list()              { return delay<DailyReportListResponse>({ status: 'success', data: { data: [...mockReports] } }); },
  getPlannedTasks()   { return delay<PlannedTasksResponse>({ status: 'success', data: { data: [...mockTasks] } }); },
  getWorkedTasks()    { return delay<WorkedTasksResponse>({ status: 'success', data: { data: [...mockWorked] } }); },
  getWeeklySchedule() { return delay<WeeklyDataResponse>({ status: 'success', data: { data: [...mockWeekly] } }); },

  create(fd: FormData) {
    const newReport = {
      id: String(nextId++), date: new Date().toISOString().split('T')[0],
      title: fd.get('title') as string, description: fd.get('description') as string,
      hours_worked: Number(fd.get('hours_worked') ?? 0), status: 'submitted' as const,
    };
    mockReports.unshift(newReport);
    return delay<DailyReportCreateResponse>({ status: 'success', message: 'تم تقديم التقرير بنجاح', data: newReport }, 600);
  },

  async history(params: { date_from?: string; date_to?: string } = {}): Promise<{ data: HistoryListResponse }> {
    const res = await http.get<RawDailyReportListResponse>('/v1/pm/reports/daily', { params });
    return {
      data: {
        status: res.data.status,
        data: {
          data: res.data.data.data.map(r => mapDailyReportHistoryItem(r as SharedRawDailyReportItem)),
        },
      },
    };
  },

  async createReport(payload: CreateDailyReportPayload) {
    const res = await http.post<RawDailyReportCreateResponse>('/v1/pm/reports/daily', payload);
    return {
      data: {
        status:  res.data.status,
        message: res.data.message,
        data:    mapDailyReportHistoryItem(res.data.data as SharedRawDailyReportItem),
      },
    };
  },

  // No dedicated "start day" endpoint exists — stash it locally and combine with
  // the end-of-day submission into the single real POST /v1/pm/reports/daily call.
  async submitStartDay(payload: StartDayPayload): Promise<{ data: { status: string; message: string } }> {
    saveDayDraft({
      checkInAt:    nowTime(),
      notes:        payload.notes,
      plannedTasks: payload.tasks,
    });
    return { data: { status: 'success', message: 'تم حفظ التقرير' } };
  },

  async submitEndDay(payload: EndDayPayload): Promise<{ data: { status: string; message: string } }> {
    const draft = getDayDraft();

    const taskMap = new Map<string, { title: string; planned: number; actual: number }>();
    for (const t of draft?.plannedTasks ?? []) {
      taskMap.set(t.id, { title: t.name, planned: t.hours, actual: 0 });
    }
    for (const t of payload.tasks) {
      const existing = taskMap.get(t.id);
      if (existing) { existing.actual = t.hours; existing.title = t.name; }
      else taskMap.set(t.id, { title: t.name, planned: 0, actual: t.hours });
    }

    // NOTE: mock task ids ("t1", "t2") aren't real backend task ids yet — this needs
    // a real "my assigned tasks" endpoint before task_id here is trustworthy.
    const tasks = [...taskMap.entries()].map(([id, v]) => ({
      task_id:       Number(id.replace(/\D/g, '')) || 0,
      task_title:    v.title,
      planned_hours: v.planned,
      actual_hours:  v.actual,
    }));

    const res = await http.post<RawDailyReportCreateResponse>('/v1/pm/reports/daily', {
      report_date:  today(),
      check_in_at:  draft?.checkInAt ?? nowTime(),
      check_out_at: nowTime(),
      summary_note: [draft?.notes, payload.reflection].filter(Boolean).join(' — '),
      tasks,
    });

    clearDayDraft();
    return { data: { status: res.data.status, message: res.data.message } };
  },
};
