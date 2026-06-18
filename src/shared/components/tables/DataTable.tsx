import type { Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Card }            from '@/shared/components/ui/Card';
import { FilterBar }       from './FilterBar';
import { TablePagination } from './TablePagination';
import type { FilterConfig } from './FilterBar';

interface SearchConfig {
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
}

interface DataTableProps<TData> {
  table:      Table<TData>;
  isAr?:      boolean;
  search?:    SearchConfig;
  filters?:   FilterConfig[];
  emptyText?: string;
}

export function DataTable<TData>({
  table,
  isAr      = false,
  search,
  filters,
  emptyText,
}: DataTableProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const firstRow  = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow   = Math.min((pageIndex + 1) * pageSize, totalRows);
  const colCount  = table.getVisibleLeafColumns().length;

  return (
    <Card overflow>
      {(search || filters?.length) && (
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  {emptyText ?? (isAr ? 'لا توجد نتائج' : 'No results found')}
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
        pageCount={table.getPageCount()}
        totalRows={totalRows}
        firstRow={firstRow}
        lastRow={lastRow}
        canPrev={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        onPrev={() => table.previousPage()}
        onNext={() => table.nextPage()}
        onPage={(i) => table.setPageIndex(i)}
        isAr={isAr}
      />
    </Card>
  );
}
