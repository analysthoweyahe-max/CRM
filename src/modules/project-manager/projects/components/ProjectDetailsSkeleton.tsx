import type { CSSProperties } from 'react';

function Pulse({ className, style }: { className: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/60 ${className}`} style={style} />;
}

function KanbanColumnSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-3 min-w-[260px]">
      <div className="flex items-center justify-between">
        <Pulse className="h-5 w-6 rounded-full" />
        <Pulse className="h-4 w-24" />
      </div>
      {[0,1,2].map(i => (
        <div key={i} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3.5 space-y-2.5">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-3 w-3/4" />
          <div className="flex items-center justify-between pt-1">
            <Pulse className="h-5 w-16 rounded-full" />
            <Pulse className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Back link */}
      <Pulse className="h-4 w-20" />

      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
        <div className="flex items-center gap-2.5 justify-end">
          <Pulse className="h-5 w-16 rounded-full" />
          <Pulse className="h-5 w-20 rounded-full" />
          <Pulse className="h-6 w-48" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Pulse className="h-3 w-8" />
            <Pulse className="h-3 w-24" />
          </div>
          <Pulse className="h-2 w-full" />
        </div>
        <Pulse className="h-3 w-28 ms-auto" />
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-700 pb-0">
        {[80, 110, 80, 90, 110].map((w, i) => (
          <Pulse key={i} className="h-9 rounded-t-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[0,1,2,3].map(i => <KanbanColumnSkeleton key={i} />)}
      </div>
    </div>
  );
}
