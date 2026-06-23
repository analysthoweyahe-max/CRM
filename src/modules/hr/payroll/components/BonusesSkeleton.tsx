import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

export function BonusesSkeleton() {
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
            <Skeleton width={240} height={14} />
          </div>
          <Skeleton width={140} height={38} borderRadius={10} />
        </div>

        {/* Stats + Settings grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Stats card */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <Skeleton width={17} height={17} circle />
                  <Skeleton width={100} height={12} />
                </div>
                <Skeleton width={70} height={22} />
              </div>
            ))}
          </div>

          {/* Settings card */}
          <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton width={180} height={16} className="mb-2" />
                <Skeleton width={220} height={12} />
              </div>
              <Skeleton width={80} height={24} borderRadius={999} />
            </div>
            <Skeleton width="100%" height={12} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton width="100%" height={44} borderRadius={10} />
              <Skeleton width="100%" height={44} borderRadius={10} />
            </div>
            <Skeleton width={90} height={38} borderRadius={10} />
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 dark:border-gray-700">
            <Skeleton width={240} height={38} borderRadius={10} />
            <Skeleton width={160} height={38} borderRadius={10} />
            <Skeleton width={160} height={38} borderRadius={10} />
          </div>

          {/* Table header */}
          <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-3.5 flex gap-6">
            {[140, 100, 80, 160, 90, 90, 80].map((w, i) => (
              <Skeleton key={i} width={w} height={14} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-6">
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
