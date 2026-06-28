function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-10 w-10 rounded-xl" />
      </div>
      <Pulse className="h-7 w-14" />
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Pulse className="h-4 w-16 rounded-full" />
        <Pulse className="h-5 w-40" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Pulse className="h-3 w-8" />
          <Pulse className="h-3 w-24" />
        </div>
        <Pulse className="h-2 w-full" />
      </div>
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-20" />
        <div className="flex gap-1">
          {[0,1,2].map(i => <Pulse key={i} className="h-7 w-7 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

export function ProjectDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
      </div>

      {/* Projects section header */}
      <div className="flex items-center justify-between">
        <Pulse className="h-9 w-32 rounded-xl" />
        <Pulse className="h-5 w-40" />
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[0,1,2,3,4,5].map(i => <ProjectCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
