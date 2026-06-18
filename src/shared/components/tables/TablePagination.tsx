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

export function TablePagination({
  pageIndex, pageCount, totalRows, firstRow, lastRow,
  canPrev, canNext, onPrev, onNext, onPage, isAr = false,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5
                    border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPage(i)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              pageIndex === i
                ? 'bg-[#A0CD39] text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {isAr
          ? `عرض ${firstRow}–${lastRow} من ${totalRows}`
          : `Showing ${firstRow}–${lastRow} of ${totalRows}`}
      </p>
    </div>
  );
}
