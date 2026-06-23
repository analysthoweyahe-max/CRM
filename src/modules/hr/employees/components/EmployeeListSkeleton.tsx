import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 flex flex-col"
         style={{ border: '1px solid #F1F5F9' }}>
      {/* Header — avatar+name first (right in RTL), badge second (left in RTL) */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Skeleton width={40} height={40} circle />
          <div className="space-y-1">
            <Skeleton width={90} height={13} />
            <Skeleton width={65} height={11} />
          </div>
        </div>
        <Skeleton width={52} height={22} borderRadius={999} />
      </div>

      <div className="h-px mx-4" style={{ background: '#D8EBAE' }} />

      {/* Fields — text first (right in RTL), icon second (left in RTL) */}
      <div className="px-4 py-3 space-y-2.5 flex-1">
        {[130, 110, 100, 115, 90].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <Skeleton width={w}  height={12} />
            <Skeleton width={13} height={13} circle />
          </div>
        ))}
      </div>

      <div className="h-px mx-4" style={{ background: '#D8EBAE' }} />

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3">
        <Skeleton width={32} height={32} borderRadius={8} />
        <Skeleton width={32} height={32} borderRadius={8} />
        <Skeleton width={32} height={32} borderRadius={8} />
      </div>
    </div>
  );
}

export function EmployeeListSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      <div className="space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={140} height={28} className="mb-2" />
            <Skeleton width={180} height={14} />
          </div>
          <Skeleton width={130} height={40} borderRadius={12} />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3">
          <Skeleton width={260} height={40} borderRadius={12} className="flex-1" />
          <Skeleton width={140} height={40} borderRadius={12} />
          <Skeleton width={140} height={40} borderRadius={12} />
          <Skeleton width={120} height={40} borderRadius={12} />
        </div>

        {/* Cards grid — 4 cols on xl, 3 on lg, 2 on sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

      </div>
    </SkeletonTheme>
  );
}
