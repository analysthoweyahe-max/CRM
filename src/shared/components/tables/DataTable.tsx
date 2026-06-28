import type { Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Card }            from '@/shared/components/ui/Card';
import { EmptyState }      from '@/shared/components/feedback/EmptyState';
import { FilterBar }       from './FilterBar';
import { TablePagination } from './TablePagination';
import type { FilterConfig } from './FilterBar';

interface SearchConfig {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}

export interface ServerPagination {
  page:     number;
  lastPage: number;
  total:    number;
  firstRow: number;
  lastRow:  number;
  onPrev:   () => void;
  onNext:   () => void;
  onPage:   (i: number) => void;
}

interface DataTableProps<TData> {
  table:             Table<TData>;
  isAr?:             boolean;
  search?:           SearchConfig;
  filters?:          FilterConfig[];
  emptyText?:        string;
  isLoading?:        boolean;
  serverPagination?: ServerPagination;
  withCard?:         boolean;
}

export function DataTable<TData>({
  table,
  isAr             = false,
  search,
  filters,
  emptyText,
  isLoading        = false,
  serverPagination,
  withCard         = true,
}: DataTableProps<TData>) {
  const colCount = table.getVisibleLeafColumns().length;

  const clientPageIndex = table.getState().pagination.pageIndex;
  const clientPageSize  = table.getState().pagination.pageSize;
  const clientTotal     = table.getFilteredRowModel().rows.length;

  const pageIndex  = serverPagination ? serverPagination.page - 1                          : clientPageIndex;
  const totalRows  = serverPagination ? serverPagination.total                             : clientTotal;
  const firstRow   = serverPagination ? serverPagination.firstRow                         : (clientTotal === 0 ? 0 : clientPageIndex * clientPageSize + 1);
  const lastRow    = serverPagination ? serverPagination.lastRow                           : Math.min((clientPageIndex + 1) * clientPageSize, clientTotal);
  const pageCount  = serverPagination ? serverPagination.lastPage                         : table.getPageCount();
  const canPrev    = serverPagination ? serverPagination.page > 1                         : table.getCanPreviousPage();
  const canNext    = serverPagination ? serverPagination.page < serverPagination.lastPage  : table.getCanNextPage();
  const handlePrev = serverPagination ? serverPagination.onPrev : () => table.previousPage();
  const handleNext = serverPagination ? serverPagination.onNext : () => table.nextPage();
  const handlePage = serverPagination ? serverPagination.onPage : (i: number) => table.setPageIndex(i);

  const inner = (
    <>
      {(search || (filters && filters.length > 0)) && (
        <FilterBar search={search} filters={filters} />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {h.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className={`inline-flex items-center gap-1.5 ${
                          h.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200'
                            : 'cursor-default'
                        }`}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (
                          h.column.getIsSorted() === 'asc'  ? <ChevronUp     size={13} className="text-brand-500" /> :
                          h.column.getIsSorted() === 'desc' ? <ChevronDown   size={13} className="text-brand-500" /> :
                          <ChevronsUpDown size={13} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  <EmptyState
                    title={emptyText ?? (isAr ? 'لا توجد نتائج' : 'No results found')}
                    description={isAr ? 'حاول تغيير معايير البحث أو الفلترة' : 'Try adjusting your search or filter criteria'}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        totalRows={totalRows}
        firstRow={firstRow}
        lastRow={lastRow}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        onPage={handlePage}
        isAr={isAr}
      />
    </>
  );

  if (!withCard) return inner;
  return <Card overflow>{inner}</Card>;
}
