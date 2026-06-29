import type {
  DailyReportListResponse, DailyReportCreateResponse,
  HistoryListResponse, PlannedTasksResponse,
  WorkedTasksResponse, WeeklyDataResponse,
  StartDayPayload, EndDayPayload,
} from '../types/dailyReport.types';

function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

const mockHistory: HistoryListResponse['data']['data'] = [
  { id: '1', date: '2026-06-19', status: 'completed' },
  { id: '2', date: '2026-06-18', status: 'completed' },
  { id: '3', date: '2026-06-17', status: 'completed' },
];

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
  history()           { return delay<HistoryListResponse>({ status: 'success', data: { data: [...mockHistory] } }); },
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

  submitStartDay(_: StartDayPayload) {
    return delay<{ status: string; message: string }>({ status: 'success', message: 'تم حفظ التقرير' }, 500);
  },

  submitEndDay(_: EndDayPayload) {
    return delay<{ status: string; message: string }>({ status: 'success', message: 'تم الإرسال للمدير' }, 500);
  },
};
