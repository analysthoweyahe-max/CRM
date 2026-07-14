import { Calendar, FileSpreadsheet } from 'lucide-react';
import { Button }           from '@/shared/components/ui/Button';
import { DailyReportCard }  from './DailyReportCard';
import {
  exportTeamReport,
  exportTeamReportsTable,
} from '@/shared/modules/daily-reports/utils/exportDailyReports';
import type { DailyReport } from '../types/teamReport.types';

interface Props {
  reports:  DailyReport[];
  date:     string;
  setDate:  (d: string) => void;
  isEmpty:  boolean;
  isAr:     boolean;
}

export function DailyReportsTab({ reports, date, setDate, isEmpty, isAr }: Props) {
  return (
    <div className="space-y-4">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          startIcon={<FileSpreadsheet size={15} />}
          disabled={isEmpty}
          onClick={() => exportTeamReportsTable(reports, date, isAr)}
        >
          {isAr ? 'تصدير الكل' : 'Export all'}
        </Button>

        <div className="relative">
          <Calendar size={14}
            className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="ps-8 pe-3 py-2 text-sm rounded-xl
                       border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-1 focus:ring-[#A0CD39]/50"
          />
        </div>
      </div>

      {isEmpty ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد تقارير لهذا اليوم' : 'No reports for this day'}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <DailyReportCard
              key={r.id}
              report={r}
              isAr={isAr}
              onExport={() => exportTeamReport(r, isAr)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
