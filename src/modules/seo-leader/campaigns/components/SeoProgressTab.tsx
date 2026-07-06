import { useState }                from 'react';
import { useQuery }                from '@tanstack/react-query';
import { Doughnut }                from 'react-chartjs-2';
import {
  Activity, CheckSquare2, UserPlus, RefreshCw,
  MessageCircle, Paperclip, ChevronDown,
} from 'lucide-react';
import { Card }                    from '@/shared/components/ui/Card';
import { Avatar }                  from '@/shared/components/ui/Avatar';
import {
  C_GREEN, C_GRAY_200, TOOLTIP_STYLE,
} from '@/modules/project-manager/projects/components/progressCharts.config';
import { TaskDistributionCard }    from '@/modules/project-manager/projects/components/TaskDistributionCard';
import { PhaseProgressCard }       from '@/modules/project-manager/projects/components/PhaseProgressCard';
import { TeamProductivityCard }    from '@/modules/project-manager/projects/components/TeamProductivityCard';
import { BurndownCard }            from '@/modules/project-manager/projects/components/BurndownCard';
import { campaignApi }             from '../api/campaign.api';
import type { SeoActivityItem }    from '../api/campaign.api';
import type { Task }               from '@/modules/project-manager/tasks/types/task.types';

/* ── Activity icon by type ───────────────────────────────────────────── */
function ActivityIcon({ type }: { type: string }) {
  if (type.startsWith('task'))   return <CheckSquare2 size={15} className="text-[#A0CD39]" />;
  if (type.startsWith('member')) return <UserPlus     size={15} className="text-sky-500"   />;
  if (type.startsWith('status')) return <RefreshCw    size={15} className="text-amber-500" />;
  if (type.startsWith('comment'))return <MessageCircle size={15} className="text-violet-500" />;
  if (type.startsWith('file'))   return <Paperclip    size={15} className="text-gray-400"  />;
  return                                <Activity      size={15} className="text-gray-400"  />;
}

/* ── Single activity row ─────────────────────────────────────────────── */
function ActivityRow({ item }: { item: SeoActivityItem }) {
  const initial = item.actor.avatarInitial ?? item.actor.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/60 last:border-0">

      {/* Icon bubble */}
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700
                      flex items-center justify-center shrink-0 mt-0.5">
        <ActivityIcon type={item.type} />
      </div>

      {/* Description + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug text-end">
          {item.description}
        </p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{item.timeAgo}</span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">·</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.actor.name}</span>
          <Avatar initial={initial} size="sm" color="bg-[#A0CD39]" />
        </div>
      </div>
    </div>
  );
}

/* ── Activity feed section ───────────────────────────────────────────── */
function SeoActivityFeed({ projectId, isAr }: { projectId: string; isAr: boolean }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey:  ['seo-activity', projectId, page],
    queryFn:   () => campaignApi.getActivity(projectId, page, 20).then(r => r.data.data),
    enabled:   !!projectId,
    staleTime: 30_000,
  });

  const items    = data?.data       ?? [];
  const hasMore  = (data?.currentPage ?? 1) < (data?.lastPage ?? 1);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 text-end">
        {isAr ? 'سجل النشاط' : 'Activity Log'}
      </h3>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full w-3/4 ms-auto" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-1/3 ms-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center">
          <Activity size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
          </p>
        </div>
      ) : (
        <>
          <div>
            {items.map(item => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              disabled={isFetching}
              className="w-full mt-4 flex items-center justify-center gap-1.5
                         text-xs text-[#709028] dark:text-[#A0CD39]
                         hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown size={14} />
              {isFetching
                ? (isAr ? 'جارٍ التحميل...' : 'Loading…')
                : (isAr ? 'تحميل المزيد' : 'Load more')}
            </button>
          )}
        </>
      )}
    </Card>
  );
}

/* ── Overall progress donut ──────────────────────────────────────────── */
function SeoProgressDonutCard({ tasks, isAr }: { tasks: Task[]; isAr: boolean }) {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress  = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 text-end">
        {isAr ? 'نسبة الإنجاز الإجمالية' : 'Overall Progress'}
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-44 h-44">
          <Doughnut
            data={{
              datasets: [{
                data: [progress, 100 - progress],
                backgroundColor: [C_GREEN, C_GRAY_200],
                borderWidth: 0,
                borderRadius: 6,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '82%',
              animation: { animateRotate: true, duration: 1000 },
              plugins: {
                legend:  { display: false },
                tooltip: { enabled: false, ...TOOLTIP_STYLE },
              },
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-none">
              {progress}%
            </span>
            <span className="text-xs text-gray-400 mt-1">{isAr ? 'الإنجاز' : 'Progress'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {completed} {isAr ? 'من' : 'of'} {total} {isAr ? 'مهمة مكتملة' : 'tasks done'}
        </p>
      </div>
    </Card>
  );
}

/* ── Main tab ────────────────────────────────────────────────────────── */
interface Props {
  projectId: string;
  tasks:     Task[];
  isAr:      boolean;
}

export function SeoProgressTab({ projectId, tasks, isAr }: Props) {
  return (
    <div className="space-y-4 pb-10">

      {/* Row 1: progress donut + task distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SeoProgressDonutCard tasks={tasks} isAr={isAr} />
        <TaskDistributionCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 2: phase progress + team productivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhaseProgressCard               isAr={isAr} />
        <TeamProductivityCard tasks={tasks} isAr={isAr} />
      </div>

      {/* Row 3: burndown — full width */}
      <BurndownCard tasks={tasks} totalTasks={tasks.length || 9} isAr={isAr} />

      {/* Row 4: activity log from API */}
      <SeoActivityFeed projectId={projectId} isAr={isAr} />

    </div>
  );
}
