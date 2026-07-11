import { CalendarRange, Download, Users } from 'lucide-react';
import { PageHeader }     from '@/shared/components/ui/PageHeader';
import { Button }         from '@/shared/components/ui/Button';
import { Card }           from '@/shared/components/ui/Card';
import { Combobox }       from '@/shared/components/form/Combobox';
import { DataTable }      from '@/shared/components/tables/DataTable';
import { EmptyState }     from '@/shared/components/feedback/EmptyState';
import { AttendanceRowsSkeleton } from '../components/AttendanceRowsSkeleton';
import { useAttendanceLogPage } from '../hooks/useAttendanceLogPage';

const dateInputCls = [
  'w-full h-11 rounded-lg border px-3 text-sm',
  'text-gray-800 dark:text-gray-200',
  'bg-white dark:bg-gray-700/50',
  'border-gray-200 dark:border-gray-600',
  'outline-none transition',
  'focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
].join(' ');

export function AttendanceLogPage() {
  const {
    isAr, selectedId, dateFrom, dateTo, page, setPage,
    empItems, records, isFetching, rangeValid,
    total, lastPage, firstRow, lastRow,
    table, setSelectedId, setDateFrom, setDateTo,
    handleExport, canExport,
  } = useAttendanceLogPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'سجل الحضور والانصراف' : 'Attendance Log'}
        subtitle={isAr ? 'عرض سجلات الحضور التفصيلية لجميع الموظفين' : 'View detailed attendance records for all employees'}
        actions={
          <Button
            variant="secondary"
            startIcon={<Download size={15} />}
            onClick={handleExport}
            disabled={!canExport}
          >
            {isAr ? 'تصدير Excel' : 'Export Excel'}
          </Button>
        }
      />

      <Card overflow>
        <div className="flex flex-wrap items-end gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-52">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              {isAr ? 'الموظف' : 'Employee'}
            </label>
            <Combobox
              items={empItems}
              value={selectedId}
              onChange={(v) => { setSelectedId(v); setPage(1); }}
              searchPlaceholder={isAr ? 'ابحث عن موظف...' : 'Search employee...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>

          <div className="w-44">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              {isAr ? 'من تاريخ' : 'From'}
            </label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className={dateInputCls}
            />
          </div>

          <div className="w-44">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              {isAr ? 'إلى تاريخ' : 'To'}
            </label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className={dateInputCls}
            />
          </div>
        </div>

        {!rangeValid ? (
          <EmptyState
            icon={<CalendarRange size={24} className="text-[#709028] dark:text-[#A0CD39]" />}
            title={isAr ? 'حدد فترة صحيحة' : 'Select a valid date range'}
            description={isAr ? 'اختر تاريخ البداية والنهاية لعرض السجل' : 'Choose from and to dates to view the log'}
          />
        ) : isFetching && records.length === 0 ? (
          <AttendanceRowsSkeleton />
        ) : total === 0 ? (
          <EmptyState
            icon={<Users size={24} className="text-[#709028] dark:text-[#A0CD39]" />}
            title={isAr ? 'لا توجد سجلات حضور' : 'No attendance records found'}
            description={isAr ? 'جرّب تغيير الفترة أو الموظف' : 'Try changing the date range or employee'}
          />
        ) : (
          <DataTable
            table={table}
            isAr={isAr}
            withCard={false}
            emptyText={isAr ? 'لا توجد سجلات حضور' : 'No attendance records found'}
            serverPagination={{
              page, lastPage, total, firstRow, lastRow,
              onPrev: () => setPage((p) => p - 1),
              onNext: () => setPage((p) => p + 1),
              onPage: (i) => setPage(i + 1),
            }}
          />
        )}
      </Card>
    </div>
  );
}
