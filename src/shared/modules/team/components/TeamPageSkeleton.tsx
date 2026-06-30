function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} />;
}

function MemberCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Pulse className="h-5 w-5 rounded" />
        <div className="flex flex-col items-center gap-2">
          <Pulse className="h-14 w-14 rounded-full" />
          <Pulse className="h-4 w-28" />
          <Pulse className="h-3 w-20" />
        </div>
        <Pulse className="h-7 w-14 rounded-full" />
      </div>
      <div className="space-y-2 pt-1 border-t border-gray-50 dark:border-gray-700/50">
        {[0, 1].map(i => (
          <div key={i} className="flex items-center justify-between">
            <Pulse className="h-3 w-16" />
            <Pulse className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Pulse className="h-8 flex-1" />
        <Pulse className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function TeamPageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="text-end space-y-1.5">
        <Pulse className="h-6 w-36 ms-auto" />
        <Pulse className="h-3 w-52 ms-auto" />
      </div>
      <Pulse className="h-4 w-44 ms-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <MemberCardSkeleton key={i} />)}
      </div>
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-32" />
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <Pulse key={i} className="h-8 w-8" />)}
        </div>
      </div>
    </div>
  );
}
