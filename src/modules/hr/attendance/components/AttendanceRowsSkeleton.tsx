import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

export function AttendanceRowsSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      {/* Table header */}
      <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex gap-5">
        {[80, 140, 110, 70, 70, 70, 60, 70, 70].map((w, i) => (
          <Skeleton key={i} width={w} height={13} />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-5"
        >
          <Skeleton width={80}  height={13} />
          <div className="flex items-center gap-2.5" style={{ minWidth: 140 }}>
            <Skeleton width={32} height={32} circle />
            <Skeleton width={90} height={13} />
          </div>
          <Skeleton width={110} height={13} />
          <Skeleton width={70}  height={13} />
          <Skeleton width={70}  height={13} />
          <Skeleton width={50}  height={13} />
          <Skeleton width={50}  height={13} />
          <Skeleton width={50}  height={13} />
          <Skeleton width={65}  height={22} borderRadius={999} />
        </div>
      ))}
    </SkeletonTheme>
  );
}
