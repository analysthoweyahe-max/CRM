import { useState }                from 'react';
import { useQuery }                from '@tanstack/react-query';
import {
  Activity, CheckSquare2, UserPlus, RefreshCw,
  MessageCircle, Paperclip, ChevronDown,
} from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import type { ProjectActivityItem, ProjectActivityPage } from '../types/projectActivity.types';

/* ── Activity icon by type ───────────────────────────────────────────── */
function ActivityIcon({ type }: { type: string }) {
  if (type.startsWith('task'))    return <CheckSquare2  size={15} className="text-[#A0CD39]" />;
  if (type.startsWith('member'))  return <UserPlus      size={15} className="text-sky-500"   />;
  if (type.startsWith('status'))  return <RefreshCw     size={15} className="text-amber-500" />;
  if (type.startsWith('comment')) return <MessageCircle size={15} className="text-violet-500" />;
  if (type.startsWith('file'))    return <Paperclip     size={15} className="text-gray-400"  />;
  return                                 <Activity      size={15} className="text-gray-400"  />;
}

/* ── Single activity row ─────────────────────────────────────────────── */
function ActivityRow({ item }: { item: ProjectActivityItem }) {
  const initial = item.actor.avatar_initial ?? item.actor.name?.[0]?.toUpperCase() ?? '?';

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
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{item.time_ago}</span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">·</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.actor.name}</span>
          <Avatar initial={initial} size="sm" color="bg-[#A0CD39]" />
        </div>
      </div>
    </div>
  );
}

/* ── Activity feed card — shared by PM & SEO project details Progress tabs ── */
interface Props {
  queryKey:       unknown[];
  fetchPage:      (page: number, perPage: number) => Promise<ProjectActivityPage>;
  isAr:           boolean;
  /** When true, render nothing if the API returns an empty first page. */
  hideWhenEmpty?: boolean;
}

export function ActivityFeedCard({ queryKey, fetchPage, isAr, hideWhenEmpty = false }: Props) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey:  [...queryKey, page],
    queryFn:   () => fetchPage(page, 20),
    staleTime: 30_000,
  });

  const items   = data?.data ?? [];
  const hasMore = (data?.current_page ?? 1) < (data?.last_page ?? 1);

  if (hideWhenEmpty && !isLoading && items.length === 0) return null;

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
