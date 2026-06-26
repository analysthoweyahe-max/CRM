import { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { useTheme } from '@/app/providers/ThemeProvider';
import type { DailyAttendanceSummary } from '@/modules/hr/attendance/types/attendance.types';
import type { DeptEntry } from '../hooks/useDashboard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DEPT_COLORS = [
  '#A0CD39', '#BCDC72', '#709028', '#A8D149',
  '#4C6320', '#587324', '#D4E9A6', '#C9E28A',
];

interface Props {
  isAr:               boolean;
  deptDistribution:   DeptEntry[];
  attendanceSummary?: DailyAttendanceSummary;
}

export function ChartsSection({ isAr, deptDistribution, attendanceSummary }: Props) {
  const { isDark } = useTheme();

  const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tickColor  = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg  = isDark ? '#1f2937' : '#ffffff';
  const tooltipFg  = isDark ? '#f3f4f6' : '#111827';

  /* ── Donut ── */
  const donutData = useMemo(() => ({
    labels:   deptDistribution.map(d => isAr ? d.nameAr : d.name),
    datasets: [{
      data:            deptDistribution.map(d => d.count),
      backgroundColor: DEPT_COLORS.slice(0, deptDistribution.length),
      borderWidth:     0,
      hoverOffset:     8,
    }],
  }), [deptDistribution, isAr]);

  const donutOptions = useMemo(() => ({
    responsive:  true,
    cutout:      '72%',
    animation:   { animateRotate: true, animateScale: true, duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor:      tooltipFg,
        bodyColor:       tickColor,
        borderColor:     gridColor,
        borderWidth:     1,
        callbacks: {
          label: (ctx: { parsed: number; label: string }) =>
            `  ${ctx.parsed} ${isAr ? 'موظف' : 'employees'}`,
        },
      },
    },
  }), [isAr, tooltipBg, tooltipFg, tickColor, gridColor]);

  /* ── Bar ── */
  const barLabels = isAr
    ? ['حضر', 'غائب', 'متأخر', 'يعمل الآن']
    : ['Present', 'Absent', 'Late', 'Working'];

  const barData = useMemo(() => ({
    labels: barLabels,
    datasets: [{
      label:           isAr ? 'الموظفون' : 'Employees',
      data: [
        attendanceSummary?.checkedIn        ?? 0,
        attendanceSummary?.absentToday      ?? 0,
        attendanceSummary?.lateArrivals     ?? 0,
        attendanceSummary?.currentlyWorking ?? 0,
      ],
      backgroundColor: ['#A0CD39', '#ef4444', '#f59e0b', '#3b82f6'],
      borderRadius:    8,
      borderWidth:     0,
    }],
  }), [attendanceSummary, isAr, barLabels]);

  const barOptions = useMemo(() => ({
    responsive:  true,
    animation:   { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor:      tooltipFg,
        bodyColor:       tickColor,
        borderColor:     gridColor,
        borderWidth:     1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid:        { color: gridColor },
        ticks:       { color: tickColor, precision: 0 },
        border:      { display: false },
      },
      x: {
        grid:   { display: false },
        ticks:  { color: tickColor },
        border: { display: false },
      },
    },
  }), [isDark, gridColor, tickColor, tooltipBg, tooltipFg]);

  const total = deptDistribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {/* Bar — Today's Attendance */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-5 shadow-sm" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'إحصائيات الحضور اليوم' : "Today's Attendance"}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'حالة الحضور الحالية' : 'Current attendance breakdown'}
        </p>
        {attendanceSummary ? (
          <Bar data={barData} options={barOptions} />
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-gray-400">
            {isAr ? 'لا توجد بيانات' : 'No data available'}
          </div>
        )}
      </div>

      {/* Doughnut — Department Distribution */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-5 shadow-sm" style={{ animationDelay: '0.18s' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'توزيع الأقسام' : 'Department Distribution'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'عدد الموظفين لكل قسم' : 'Employees per department'}
        </p>
        {deptDistribution.length > 0 ? (
          <div className="flex items-center gap-5">
            {/* Donut with center label */}
            <div className="relative shrink-0 w-36 h-36">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</span>
                <span className="text-[10px] text-gray-400">{isAr ? 'موظف' : 'staff'}</span>
              </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-1 gap-1.5 flex-1 min-w-0 max-h-36 overflow-y-auto">
              {deptDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {isAr ? d.nameAr : d.name}
                  </span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 ms-auto shrink-0">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-xs text-gray-400">
            {isAr ? 'لا توجد بيانات' : 'No data available'}
          </div>
        )}
      </div>

    </div>
  );
}
