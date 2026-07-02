import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from '@/shared/components/ui/Card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { C_GREEN } from './adminCharts.config';
import type { DepartmentDistributionItem } from '../types/adminDashboard.types';

interface Props {
  departments: DepartmentDistributionItem[];
  isAr:        boolean;
}

export function DepartmentDistributionCard({ departments, isAr }: Props) {
  const { isDark } = useTheme();
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';

  const data = useMemo(() => ({
    labels: departments.map(d => isAr ? d.labelAr : d.labelEn),
    datasets: [{
      data:            departments.map(d => d.value),
      backgroundColor: C_GREEN,
      borderRadius:    8,
      borderSkipped:   false,
      barThickness:    16,
    }],
  }), [departments, isAr]);

  const options = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900 },
    plugins: {
      legend:  { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor:      isDark ? '#f3f4f6' : '#111827',
        bodyColor:       isDark ? '#9ca3af' : '#6b7280',
        padding: 10,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid:   { color: gridColor },
        ticks:  { color: tickColor, precision: 0 },
        border: { display: false },
      },
      y: {
        grid:   { display: false },
        ticks:  { color: tickColor },
        border: { display: false },
      },
    },
  }), [gridColor, tickColor, isDark]);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-end mb-5">
        {isAr ? 'الموظفون حسب القسم' : 'Employees by Department'}
      </h3>
      <div style={{ height: `${departments.length * 40}px` }}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
}
