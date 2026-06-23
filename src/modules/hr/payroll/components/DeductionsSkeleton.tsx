import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

export function DeductionsSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={160} height={28} className="mb-2" />
            <Skeleton width={220} height={14} />
          </div>
          <Skeleton width={130} height={38} borderRadius={10} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700
                                    bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center gap-4">
              <Skeleton width={44} height={44} borderRadius={12} />
              <div>
                <Skeleton width={70} height={22} className="mb-1" />
                <Skeleton width={110} height={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <Skeleton width={220} height={38} borderRadius={10} />
            <Skeleton width={160} height={38} borderRadius={10} />
            <Skeleton width={160} height={38} borderRadius={10} />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-3.5 flex gap-6">
            {[140, 100, 80, 160, 90, 90, 80].map((w, i) => (
              <Skeleton key={i} width={w} height={14} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-6">
              {/* Employee cell */}
              <div className="flex items-center gap-3" style={{ minWidth: 140 }}>
                <Skeleton width={36} height={36} circle />
                <div>
                  <Skeleton width={80} height={13} className="mb-1" />
                  <Skeleton width={100} height={11} />
                </div>
              </div>
              <Skeleton width={100} height={13} />
              <Skeleton width={80}  height={13} />
              <Skeleton width={160} height={13} />
              <Skeleton width={90}  height={13} />
              <Skeleton width={90}  height={13} />
              <Skeleton width={60}  height={22} borderRadius={999} />
            </div>
          ))}

          {/* Pagination */}
          <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <Skeleton width={120} height={14} />
            <div className="flex gap-2">
              <Skeleton width={34} height={34} borderRadius={8} />
              <Skeleton width={34} height={34} borderRadius={8} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
