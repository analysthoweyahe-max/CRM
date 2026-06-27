import { useState, useMemo } from 'react';
import type { DailyReport } from '../types/report.types';

const today = new Date().toISOString().slice(0, 10);

const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
})();

const MOCK: DailyReport[] = [
  {
    id: '1', date: today,
    memberName: 'محمد علي', memberInitial: 'م', memberColor: 'bg-purple-500',
    checkIn: '09:00', checkOut: '17:00',
    entry: { taskTitle: 'تطوير واجهة المستخدم', plannedHours: 5, actualHours: 6.5 },
    notes: 'تم إنجاز معظم المكونات الرئيسية.',
  },
  {
    id: '2', date: today,
    memberName: 'سارة خليل', memberInitial: 'س', memberColor: 'bg-rose-500',
    checkIn: '08:45', checkOut: '16:30',
    entry: { taskTitle: 'تصميم واجهات الصفحات', plannedHours: 6, actualHours: 5 },
    notes: 'بانتظار ملاحظات على بعض الشاشات.',
  },
  {
    id: '3', date: yesterday,
    memberName: 'ياسر حسن', memberInitial: 'ي', memberColor: 'bg-sky-500',
    checkIn: '09:15', checkOut: '17:30',
    entry: { taskTitle: 'كتابة اختبارات الوحدة', plannedHours: 4, actualHours: 4 },
    notes: '',
  },
  {
    id: '4', date: yesterday,
    memberName: 'محمد علي', memberInitial: 'م', memberColor: 'bg-purple-500',
    checkIn: '09:00', checkOut: '18:00',
    entry: { taskTitle: 'مراجعة كود الـ API', plannedHours: 3, actualHours: 4 },
    notes: 'اكتشاف بعض المشاكل في endpoints التوثيق.',
  },
];

export function useDailyReports() {
  const [date, setDate] = useState(today);

  const reports = useMemo(
    () => MOCK.filter(r => r.date === date),
    [date],
  );

  const isEmpty = reports.length === 0;

  return { reports, date, setDate, isEmpty };
}
