import { Users, Download } from 'lucide-react';
import { PageHeader }     from '@/shared/components/ui/PageHeader';
import { Button }         from '@/shared/components/ui/Button';
import { Card }           from '@/shared/components/ui/Card';
import { FilterBar }      from '@/shared/components/tables/FilterBar';
import { DataTable }      from '@/shared/components/tables/DataTable';
import { EmployeeBanner } from '../components/EmployeeBanner';
import { printAttendance } from '../utils/printAttendance';
import { useAttendanceLogPage } from '../hooks/useAttendanceLogPage';

export function AttendanceLogPage() {
  const {
    isAr, selectedId, month, page, setPage,
    empItems, monthItems, selectedEmp, records, isFetching,
    total, lastPage, firstRow, lastRow,
    table, setSelectedId, setMonth,
  } = useAttendanceLogPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'سجل الحضور والانصراف' : 'Attendance Log'}
        subtitle={isAr ? 'عرض سجلات الحضور التفصيلية للموظفين' : 'View detailed employee attendance records'}
        actions={selectedId ? (
          <Button variant="secondary" startIcon={<Download size={15} />}
            onClick={() => printAttendance(records, selectedEmp?.name ?? '', isAr)}>
            {isAr ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        ) : undefined}
      />

      <Card overflow>
        <FilterBar
          filters={[
            {
              key: 'emp', value: selectedId, items: empItems,
              onChange: (v) => { setSelectedId(v); setPage(1); },
              searchPlaceholder: isAr ? 'ابحث عن موظف...' : 'Search employee...',
              noResultsText:     isAr ? 'لا نتائج' : 'No results',
              width:             'w-52',
            },
            {
              key: 'month', value: month, items: monthItems,
              onChange: (v) => { setMonth(v); setPage(1); },
              searchPlaceholder: isAr ? 'ابحث...' : 'Search...',
              noResultsText:     isAr ? 'لا نتائج' : 'No results',
              width:             'w-44',
            },
          ]}
        />

        {!selectedId ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700
                            flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isAr ? 'اختر موظفاً لعرض سجل حضوره' : 'Select an employee to view their attendance log'}
            </p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
              {isAr ? 'استخدم القائمة أعلاه للبحث عن موظف' : 'Use the dropdown above to search for an employee'}
            </p>
          </div>
        ) : (
          <>
            {selectedEmp && <EmployeeBanner emp={selectedEmp} total={total} isAr={isAr} />}
            <DataTable
              table={table}
              isAr={isAr}
              withCard={false}
              isLoading={isFetching && records.length === 0}
              emptyText={isAr ? 'لا توجد سجلات حضور' : 'No attendance records found'}
              serverPagination={{
                page, lastPage, total, firstRow, lastRow,
                onPrev: () => setPage((p) => p - 1),
                onNext: () => setPage((p) => p + 1),
                onPage: (i) => setPage(i + 1),
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
