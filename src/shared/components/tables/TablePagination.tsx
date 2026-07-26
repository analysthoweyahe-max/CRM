import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  pageIndex: number;
  pageCount: number;
  totalRows: number;
  firstRow:  number;
  lastRow:   number;
  canPrev:   boolean;
  canNext:   boolean;
  onPrev:    () => void;
  onNext:    () => void;
  onPage:    (i: number) => void;
  isAr?:     boolean;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

const SIBLING_COUNT = 1;

/** Windows the page list to first/last + a neighborhood around the current
 *  page, collapsing the rest behind ellipses — avoids rendering one button
 *  per page when there are dozens/hundreds of pages. */
function buildPageItems(pageIndex: number, pageCount: number): PageItem[] {
  const maxVisible = SIBLING_COUNT * 2 + 5;
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const left  = Math.max(pageIndex - SIBLING_COUNT, 1);
  const right = Math.min(pageIndex + SIBLING_COUNT, pageCount - 2);

  const items: PageItem[] = [0];
  if (left > 1) items.push('ellipsis-start');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < pageCount - 2) items.push('ellipsis-end');
  items.push(pageCount - 1);

  return items;
}

export function TablePagination({
  pageIndex, pageCount, totalRows, firstRow, lastRow,
  canPrev, canNext, onPrev, onNext, onPage, isAr = false,
}: TablePaginationProps) {
  const pageItems = buildPageItems(pageIndex, pageCount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3.5
                    border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="shrink-0 p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        {pageItems.map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              className={`shrink-0 w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                pageIndex === item
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item + 1}
            </button>
          ) : (
            <span
              key={item}
              className="shrink-0 w-8 h-8 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none"
            >
              …
            </span>
          )
        ))}

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="shrink-0 p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {isAr
          ? `عرض ${firstRow}–${lastRow} من ${totalRows}`
          : `Showing ${firstRow}–${lastRow} of ${totalRows}`}
      </p>
    </div>
  );
}
