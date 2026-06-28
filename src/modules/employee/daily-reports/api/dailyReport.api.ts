import type {
  DailyReportListResponse,
  DailyReportCreateResponse,
} from '../types/dailyReport.types';

function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(res => setTimeout(() => res({ data }), ms));
}

const mockReports: DailyReportListResponse['data']['data'] = [
  { id: '1', date: '2026-06-27', title: 'تقرير يوم الجمعة',    description: 'إنهاء تصميم الواجهة وعرضها على الفريق',      hours_worked: 7,   status: 'approved',  feedback: 'عمل ممتاز' },
  { id: '2', date: '2026-06-26', title: 'تقرير يوم الخميس',    description: 'تطوير API المستخدمين وكتابة الاختبارات',       hours_worked: 8,   status: 'approved'  },
  { id: '3', date: '2026-06-25', title: 'تقرير يوم الأربعاء',  description: 'مراجعة متطلبات المشروع الجديد مع العميل',     hours_worked: 6,   status: 'submitted' },
  { id: '4', date: '2026-06-24', title: 'تقرير يوم الثلاثاء',  description: 'إصلاح أخطاء في وحدة الرواتب',                hours_worked: 7.5, status: 'rejected',  feedback: 'يرجى توضيح المهام بشكل أدق' },
  { id: '5', date: '2026-06-23', title: 'تقرير يوم الاثنين',   description: 'اجتماع الفريق ومراجعة Sprint الأسبوعي',       hours_worked: 5,   status: 'approved'  },
];

let nextId = 6;

export const dailyReportApi = {
  list() {
    return delay<DailyReportListResponse>({
      status: 'success',
      data:   { data: [...mockReports] },
    });
  },

  create(fd: FormData) {
    const title        = fd.get('title')        as string;
    const description  = fd.get('description')  as string;
    const hours_worked = Number(fd.get('hours_worked') ?? 0);
    const date         = new Date().toISOString().split('T')[0];

    const newReport = {
      id:   String(nextId++),
      date,
      title,
      description,
      hours_worked,
      status: 'submitted' as const,
    };

    mockReports.unshift(newReport);

    return delay<DailyReportCreateResponse>({
      status:  'success',
      message: 'تم تقديم التقرير بنجاح',
      data:    newReport,
    }, 600);
  },
};
