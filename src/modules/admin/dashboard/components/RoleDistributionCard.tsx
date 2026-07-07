import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '@/shared/components/ui/Card';
import { useTheme } from '@/app/providers/ThemeProvider';
import './adminCharts.config';
import type { RoleDistributionItem } from '../types/adminDashboard.types';

interface Props {
  roles: RoleDistributionItem[];
  isAr:  boolean;
}

export function RoleDistributionCard({ roles, isAr }: Props) {
  const { isDark } = useTheme();
  const total = roles.reduce((sum, r) => sum + r.value, 0);

  const data = useMemo(() => ({
    datasets: [{
      data:            roles.map(r => r.value),
      backgroundColor: roles.map(r => r.color),
      borderWidth:     0,
      hoverOffset:     8,
    }],
  }), [roles]);

  const options = useMemo(() => ({
    responsive:  true,
    maintainAspectRatio: false,
    cutout:      '75%',
    animation:   { animateRotate: true, animateScale: true, duration: 900 },
    plugins: {
      legend:  { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor:      isDark ? '#f3f4f6' : '#111827',
        bodyColor:       isDark ? '#9ca3af' : '#6b7280',
        padding: 10,
      },
    },
  }), [isDark]);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'توزيع الموظفين حسب الدور' : 'Employee Distribution by Role'}
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6 mt-5">
        <div className="relative shrink-0 w-40 h-40">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{total}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{isAr ? 'موظف' : 'staff'}</span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2.5">
          {roles.map(r => (
            <div key={r.labelEn} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">
                {isAr ? r.labelAr : r.labelEn}
              </span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 shrink-0">
                {r.value} ({r.percent}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
