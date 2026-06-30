import { RequestCard }                        from './RequestCard';
import type { RequestItem, FilterKey }         from '../types/teamReport.types';

const FILTERS: { key: FilterKey; ar: string; en: string }[] = [
  { key: 'all',      ar: 'الكل',         en: 'All'          },
  { key: 'pending',  ar: 'قيد المراجعة', en: 'Under Review' },
  { key: 'approved', ar: 'موافق عليه',   en: 'Approved'     },
  { key: 'rejected', ar: 'مرفوض',        en: 'Rejected'     },
];

interface Props {
  visible:   RequestItem[];
  filter:    FilterKey;
  setFilter: (f: FilterKey) => void;
  approve:   (id: string) => void;
  reject:    (id: string) => void;
  isAr:      boolean;
}

export function RequestsTab({ visible, filter, setFilter, approve, reject, isAr }: Props) {
  return (
    <div className="space-y-4">

      {/* Filter pills */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f.key
                ? 'bg-[#A0CD39] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#A0CD39]/50',
            ].join(' ')}
          >
            {isAr ? f.ar : f.en}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {visible.map(item => (
          <RequestCard
            key={item.id}
            item={item}
            onApprove={approve}
            onReject={reject}
            isAr={isAr}
          />
        ))}

        {visible.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
            {isAr ? 'لا توجد طلبات' : 'No requests found'}
          </p>
        )}
      </div>
    </div>
  );
}
