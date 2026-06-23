import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
      {children}
    </div>
  );
}

/* ── Stat Cards ─────────────────────────────────────────────────── */
function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700
                                bg-white dark:bg-gray-800 shadow-sm px-4 pt-5 pb-4 flex flex-col items-center gap-3">
          <Skeleton width={52} height={52} borderRadius={16} />
          <Skeleton width={48} height={28} />
          <Skeleton width={80} height={12} />
        </div>
      ))}
    </div>
  );
}

/* ── Charts ─────────────────────────────────────────────────────── */
function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <Skeleton width={180} height={16} className="mb-1" />
        <Skeleton width={120} height={12} className="mb-4" />
        <Skeleton height={200} borderRadius={12} />
      </Card>
      <Card>
        <Skeleton width={140} height={16} className="mb-1" />
        <Skeleton width={110} height={12} className="mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton width={164} height={164} circle />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={12} borderRadius={8} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Quick Actions ──────────────────────────────────────────────── */
function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700
                                bg-white dark:bg-gray-800 shadow-sm px-5 py-4
                                flex items-center justify-between">
          <Skeleton width={90} height={16} />
          <Skeleton width={52} height={52} borderRadius={16} />
        </div>
      ))}
    </div>
  );
}

/* ── Recent Data ────────────────────────────────────────────────── */
function RecentDataSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((j) => (
          <Card key={j}>
            <Skeleton width={140} height={16} className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton width={32} height={32} circle />
                  <div className="flex-1">
                    <Skeleton width={100} height={13} className="mb-1" />
                    <Skeleton width={140} height={11} />
                  </div>
                  <Skeleton width={52} height={22} borderRadius={999} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton width={160} height={16} className="mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton width={32} height={32} circle />
              <div className="flex-1">
                <Skeleton width={110} height={13} className="mb-1" />
                <Skeleton width={150} height={11} />
              </div>
              <Skeleton width={62} height={22} borderRadius={999} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Full Dashboard Skeleton ────────────────────────────────────── */
export function DashboardSkeleton() {
  const { isDark } = useTheme();

  return (
    <SkeletonTheme
      baseColor={isDark ? '#374151' : '#f3f4f6'}
      highlightColor={isDark ? '#4b5563' : '#e5e7eb'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Skeleton width={220} height={24} className="mb-2" />
          <Skeleton width={300} height={14} />
        </div>

        <StatCardsSkeleton />
        <ChartsSkeleton />
        <QuickActionsSkeleton />
        <RecentDataSkeleton />
      </div>
    </SkeletonTheme>
  );
}
