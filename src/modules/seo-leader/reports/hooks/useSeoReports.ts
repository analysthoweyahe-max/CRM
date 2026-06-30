import { useState, useMemo } from 'react';
import type { DailyReport } from '@/shared/modules/team-reports/types/teamReport.types';

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
    entry: {
      tasks: ['تحسين 3 صفحات محتوى (بحث الكلمات)', 'مراجعة روابط داخلية لصفحة الخدمات'],
      plannedHours: 5, actualHours: 6.5,
    },
    notes: 'تم الانتهاء من تحليل المنافسين الرئيسيين.',
  },
  {
    id: '2', date: today,
    memberName: 'سارة خليل', memberInitial: 'س', memberColor: 'bg-emerald-500',
    checkIn: '08:45', checkOut: '16:30',
    entry: {
      tasks: ['كتابة مقالين للمدونة', 'تحديث خطة المحتوى'],
      plannedHours: 6, actualHours: 5,
    },
    notes: 'بانتظار ملاحظات على بعض العناوين.',
  },
  {
    id: '3', date: yesterday,
    memberName: 'يوسف حسن', memberInitial: 'ي', memberColor: 'bg-sky-500',
    checkIn: '09:00', checkOut: '17:00',
    entry: {
      tasks: ['تحليل الكلمات المفتاحية للمنافسين', 'إعداد تقرير الأداء الأسبوعي'],
      plannedHours: 4, actualHours: 4.5,
    },
    notes: 'ارتفاع ملحوظ في معدل النقر على الروابط.',
  },
  {
    id: '4', date: yesterday,
    memberName: 'سارة خليل', memberInitial: 'س', memberColor: 'bg-emerald-500',
    checkIn: '08:30', checkOut: '16:00',
    entry: {
      tasks: ['تحسين الوصف التعريفي لـ 5 صفحات', 'بناء روابط خلفية جديدة'],
      plannedHours: 5, actualHours: 5,
    },
    notes: '',
  },
];

export function useSeoReports() {
  const [date, setDate] = useState(today);

  const reports = useMemo(
    () => MOCK.filter(r => r.date === date),
    [date],
  );

  return { reports, date, setDate, isEmpty: reports.length === 0 };
}
