import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

const ROWS = 8;

export function LeavesSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      <div className="space-y-5">

        {/* Page header */}
        <div>
          <Skeleton width={180} height={28} borderRadius={8} />
          <Skeleton width={260} height={14} className="mt-2" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm overflow-hidden">

          {/* Filter tabs */}
          <div className="flex items-center gap-2 p-4 pb-0">
            {[90, 70, 100, 70].map((w, i) => (
              <Skeleton key={i} width={w} height={34} borderRadius={8} />
            ))}
          </div>

          {/* Search */}
          <div className="p-4">
            <Skeleton height={42} borderRadius={12} />
          </div>

          {/* Table header */}
          <div className="border-y border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30
                          px-4 py-3 flex items-center gap-4">
            {[140, 90, 80, 80, 70, 90, 80, 60].map((w, i) => (
              <Skeleton key={i} width={w} height={12} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: ROWS }).map((_, i) => (
            <div key={i}
              className="px-4 py-3.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-4">
              {/* Employee avatar + name */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <Skeleton width={32} height={32} circle />
                <div>
                  <Skeleton width={90} height={13} />
                  <Skeleton width={60} height={11} className="mt-1" />
                </div>
              </div>
              <Skeleton width={90}  height={13} />
              <Skeleton width={80}  height={13} />
              <Skeleton width={80}  height={13} />
              <Skeleton width={70}  height={13} />
              <Skeleton width={90}  height={13} />
              <Skeleton width={80}  height={22} borderRadius={999} />
              {/* Actions */}
              <div className="flex gap-1.5">
                <Skeleton width={28} height={28} borderRadius={8} />
                <Skeleton width={28} height={28} borderRadius={8} />
                <Skeleton width={28} height={28} borderRadius={8} />
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700
                          flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
            </div>
            <Skeleton width={140} height={13} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
