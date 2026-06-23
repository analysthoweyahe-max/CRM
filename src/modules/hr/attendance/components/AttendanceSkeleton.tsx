import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

export function AttendanceSkeleton() {
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
            <Skeleton width={180} height={28} className="mb-2" />
            <Skeleton width={260} height={14} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700
                                    bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton width={44} height={44} borderRadius={12} />
                <div>
                  <Skeleton width={40} height={24} className="mb-1" />
                  <Skeleton width={100} height={12} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
            <Skeleton width={260} height={36} borderRadius={8} />
            <Skeleton width={140} height={36} borderRadius={8} />
            <Skeleton width={140} height={36} borderRadius={8} />
          </div>

          {/* Table header */}
          <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex gap-6">
            {[80, 140, 110, 70, 70, 90, 80, 90].map((w, i) => (
              <Skeleton key={i} width={w} height={13} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-6">
              <Skeleton width={80}  height={13} />
              <div className="flex items-center gap-2.5" style={{ minWidth: 140 }}>
                <Skeleton width={32} height={32} circle />
                <Skeleton width={90} height={13} />
              </div>
              <Skeleton width={110} height={13} />
              <Skeleton width={70}  height={13} />
              <Skeleton width={70}  height={13} />
              <Skeleton width={60}  height={13} />
              <Skeleton width={70}  height={22} borderRadius={999} />
              <Skeleton width={90}  height={13} />
            </div>
          ))}

          {/* Pagination */}
          <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <Skeleton width={130} height={13} />
            <div className="flex gap-2">
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={32} height={32} borderRadius={8} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
