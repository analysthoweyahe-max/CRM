function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-32" />
        <div className="flex items-center gap-2">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Pulse className="h-20 rounded-xl" />
        <Pulse className="h-20 rounded-xl" />
      </div>
    </div>
  );
}

export function TeamReportsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-end space-y-1.5">
        <Pulse className="h-6 w-64 ms-auto" />
        <Pulse className="h-3 w-40 ms-auto" />
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-2 justify-end">
        <Pulse className="h-9 w-28 rounded-xl" />
        <Pulse className="h-9 w-20 rounded-xl" />
      </div>

      {/* Date picker placeholder */}
      <div className="flex justify-end">
        <Pulse className="h-9 w-40 rounded-xl" />
      </div>

      {/* Cards */}
      {[0, 1, 2].map(i => <CardSkeleton key={i} />)}
    </div>
  );
}
