function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} />;
}

function ReportRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700/50">
      <Pulse className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Pulse className="h-3.5 w-48" />
        <Pulse className="h-3 w-72" />
      </div>
      <Pulse className="h-5 w-20 rounded-full shrink-0" />
      <Pulse className="h-3 w-16 shrink-0" />
    </div>
  );
}

export function ProjectReportsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-end space-y-1.5">
        <Pulse className="h-6 w-64 ms-auto" />
        <Pulse className="h-3 w-40 ms-auto" />
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-2 justify-end">
        <Pulse className="h-9 w-24 rounded-xl" />
        <Pulse className="h-9 w-20 rounded-xl" />
      </div>

      {/* Card with rows */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <Pulse className="h-9 w-40 rounded-xl" />
          <Pulse className="h-9 w-32 rounded-xl" />
        </div>
        {[0,1,2,3,4].map(i => <ReportRowSkeleton key={i} />)}
      </div>
    </div>
  );
}
