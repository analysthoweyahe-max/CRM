import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

export function EmployeeDetailSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      <div className="space-y-5">

        {/* Page header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Skeleton width={32} height={32} borderRadius={10} />
            <Skeleton width={160} height={24} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={100} height={36} borderRadius={10} />
            <Skeleton width={120} height={36} borderRadius={10} />
          </div>
        </div>

        {/* Banner card */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm">
          {/* Green gradient placeholder */}
          <div className="h-28 bg-gradient-to-br from-[#A0CD39]/40 to-[#709028]/40" />

          {/* Avatar + info */}
          <div className="px-6 pb-0">
            <div className="-mt-8 mb-4">
              <Skeleton width={64} height={64} circle />
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton width={180} height={22} />
                  <Skeleton width={70} height={20} borderRadius={999} />
                </div>
                <Skeleton width={140} height={14} className="mt-1" />
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <Skeleton width={80} height={16} />
                  <Skeleton width={90} height={12} className="mt-1" />
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />
                <div className="text-center">
                  <Skeleton width={60} height={16} />
                  <Skeleton width={80} height={12} className="mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-6">
            <div className="flex gap-1 py-1">
              {[80, 110, 90, 90, 80].map((w, i) => (
                <Skeleton key={i} width={w} height={36} borderRadius={6} />
              ))}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Info card (2/3) */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <Skeleton width={140} height={16} />
              <Skeleton width={28} height={28} borderRadius={8} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton width={32} height={32} borderRadius={8} />
                  <div>
                    <Skeleton width={70} height={11} className="mb-1" />
                    <Skeleton width={110 + (i % 3) * 20} height={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave balance card (1/3) */}
          <div className="rounded-2xl bg-white dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <Skeleton width={100} height={16} className="mb-5" />
            <div className="text-center mb-4">
              <Skeleton width={60} height={40} className="mx-auto" />
              <Skeleton width={120} height={11} className="mt-1 mx-auto" />
            </div>
            <div className="space-y-3">
              <Skeleton height={72} borderRadius={12} />
              <Skeleton height={72} borderRadius={12} />
            </div>
            <Skeleton width={150} height={11} className="mt-4 mx-auto" />
          </div>

        </div>
      </div>
    </SkeletonTheme>
  );
}
