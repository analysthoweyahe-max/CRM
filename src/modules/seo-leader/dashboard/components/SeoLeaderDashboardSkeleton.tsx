function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-center gap-4">
      <Pulse className="w-12 h-12 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Pulse className="h-7 w-14" />
        <Pulse className="h-4 w-24" />
      </div>
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <Pulse className="h-5 w-40" />
          <Pulse className="h-3.5 w-28" />
        </div>
        <Pulse className="h-6 w-16 rounded-full shrink-0" />
      </div>
      <Pulse className="h-3.5 w-48" />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Pulse className="h-3 w-16" />
          <Pulse className="h-3 w-8" />
        </div>
        <Pulse className="h-2 w-full" />
      </div>
      <div className="flex items-center justify-between">
        <Pulse className="h-6 w-24 rounded-full" />
        <div className="flex">
          {[0,1,2].map(i => <Pulse key={i} className="w-7 h-7 rounded-full -ms-1 first:ms-0" />)}
        </div>
      </div>
      <Pulse className="h-9 w-full rounded-xl" />
    </div>
  );
}

export function SeoLeaderDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
      </div>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
        <div className="flex gap-3">
          {[0,1,2,3].map(i => <Pulse key={i} className="h-9 w-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0,1,2,3].map(i => <CampaignCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
