import { useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Download } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { C_GREEN } from './salesCharts.config';
import type { SalesLeadSource } from '../hooks/useSalesDashboardMock';

interface Props {
  isAr:        boolean;
  revenueTrend: { labelsAr: string[]; labelsEn: string[]; data: number[] };
  leadSources: SalesLeadSource[];
}

export function SalesChartsSection({ isAr, revenueTrend, leadSources }: Props) {
  const { isDark } = useTheme();

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipFg = isDark ? '#f3f4f6' : '#111827';

  const lineData = useMemo(() => ({
    labels: isAr ? revenueTrend.labelsAr : revenueTrend.labelsEn,
    datasets: [{
      data:            revenueTrend.data,
      borderColor:     C_GREEN,
      backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'transparent';
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(160, 205, 57, 0.35)');
        gradient.addColorStop(1, 'rgba(160, 205, 57, 0)');
        return gradient;
      },
      fill:        true,
      tension:     0.4,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: C_GREEN,
      pointHoverBorderColor: '#fff',
    }],
  }), [revenueTrend, isAr]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor:      tooltipFg,
        bodyColor:       tickColor,
        borderColor:     gridColor,
        borderWidth:     1,
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `  ${ctx.parsed.y ?? 0}${isAr ? 'ك ر.س' : 'k SAR'}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid:        { color: gridColor },
        ticks:       { color: tickColor, callback: (v: number | string) => `${v}${isAr ? 'ك' : 'k'}` },
        border:      { display: false },
      },
      x: {
        grid:   { display: false },
        ticks:  { color: tickColor },
        border: { display: false },
      },
    },
  }), [gridColor, tickColor, tooltipBg, tooltipFg, isAr]);

  const donutData = useMemo(() => ({
    labels:   leadSources.map(s => isAr ? s.labelAr : s.labelEn),
    datasets: [{
      data:            leadSources.map(s => s.count),
      backgroundColor: leadSources.map(s => s.color),
      borderWidth:     0,
      hoverOffset:     8,
    }],
  }), [leadSources, isAr]);

  const donutOptions = useMemo(() => ({
    responsive: true,
    cutout:     '68%',
    animation:  { animateRotate: true, animateScale: true, duration: 900 },
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
  }), [tooltipBg, tooltipFg, tickColor, gridColor]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

      {/* Revenue trend */}
      <Card padding="md" className="lg:col-span-2 fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-y-2 mb-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isAr ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {isAr ? 'آخر 6 أشهر' : 'Last 6 months'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400
                       hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <Download size={13} />
            {isAr ? 'تصدير' : 'Export'}
          </button>
        </div>
        <div className="h-64 mt-4">
          <Line data={lineData} options={lineOptions} />
        </div>
      </Card>

      {/* Lead sources */}
      <Card padding="md" className="fade-in-up">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'مصادر العملاء المحتملين' : 'Lead Sources'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'توزيع حسب القناة' : 'Distribution by channel'}
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 shrink-0">
            <Doughnut data={donutData} options={donutOptions} />
          </div>

          <div className="w-full space-y-2">
            {leadSources.map(s => (
              <div key={s.key} className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                  {isAr ? s.labelAr : s.labelEn}
                </span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 shrink-0">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
