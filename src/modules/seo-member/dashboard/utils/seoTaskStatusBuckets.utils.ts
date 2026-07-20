import type { SeoTaskStatusOption } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

export type SeoDashboardStatusBucket = 'completed' | 'needs_review' | 'in_progress' | 'pending';

const REVIEW_KEYS = new Set(['in_review', 'review', 'needs_review']);
const IN_PROGRESS_KEYS = new Set(['in_progress', 'inProgress']);

export function resolveSeoTaskBucket(
  rawKey: string,
  marksCompletedByKey: Record<string, boolean>,
): SeoDashboardStatusBucket {
  if (marksCompletedByKey[rawKey]) return 'completed';
  if (REVIEW_KEYS.has(rawKey)) return 'needs_review';
  if (IN_PROGRESS_KEYS.has(rawKey)) return 'in_progress';
  return 'pending';
}

export function buildMarksCompletedMap(statusOptions: SeoTaskStatusOption[]): Record<string, boolean> {
  return Object.fromEntries(statusOptions.map(s => [s.key, s.marksCompleted]));
}

export interface SeoDashboardStatCard {
  bucket:    SeoDashboardStatusBucket;
  filterKey: string;
  count:     number;
  labelAr:   string;
  labelEn:   string;
}

const BUCKET_LABELS: Record<SeoDashboardStatusBucket, { labelAr: string; labelEn: string }> = {
  completed:    { labelAr: 'مكتمل',           labelEn: 'Completed'    },
  needs_review: { labelAr: 'بحاجة للمراجعة', labelEn: 'Needs Review' },
  in_progress:  { labelAr: 'قيد التنفيذ',     labelEn: 'In Progress'  },
  pending:      { labelAr: 'قيد الانتظار',    labelEn: 'Pending'      },
};

const BUCKET_ORDER: SeoDashboardStatusBucket[] = [
  'completed',
  'needs_review',
  'in_progress',
  'pending',
];

/** Resolve the raw status keys present in tasks for each dashboard bucket. */
function bucketStatusKeys(
  tasks: SeoTask[],
  marksCompletedByKey: Record<string, boolean>,
): Record<SeoDashboardStatusBucket, string[]> {
  const keys: Record<SeoDashboardStatusBucket, Set<string>> = {
    completed:    new Set(),
    needs_review: new Set(),
    in_progress:  new Set(),
    pending:      new Set(),
  };

  for (const task of tasks) {
    if (!task.status) continue;
    keys[resolveSeoTaskBucket(task.status, marksCompletedByKey)].add(task.status);
  }

  return {
    completed:    [...keys.completed],
    needs_review: [...keys.needs_review],
    in_progress:  [...keys.in_progress],
    pending:      [...keys.pending],
  };
}

function primaryFilterKey(
  bucket: SeoDashboardStatusBucket,
  tasks: SeoTask[],
  marksCompletedByKey: Record<string, boolean>,
  statusOptions: SeoTaskStatusOption[],
): string {
  const keysInTasks = bucketStatusKeys(tasks, marksCompletedByKey)[bucket];
  if (keysInTasks.length === 1) return keysInTasks[0];

  if (keysInTasks.length > 1) {
    const counts = new Map<string, number>();
    for (const task of tasks) {
      if (resolveSeoTaskBucket(task.status, marksCompletedByKey) !== bucket) continue;
      counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? keysInTasks[0];
  }

  const fallbackByBucket: Record<SeoDashboardStatusBucket, string[]> = {
    completed:    ['completed', 'done'],
    needs_review: ['in_review', 'review', 'needs_review'],
    in_progress:  ['in_progress', 'inProgress'],
    pending:      ['pending'],
  };

  for (const key of fallbackByBucket[bucket]) {
    if (statusOptions.some(s => s.key === key)) return key;
  }

  return '';
}

export function buildSeoDashboardStatCards(
  tasks: SeoTask[],
  statusOptions: SeoTaskStatusOption[],
): SeoDashboardStatCard[] {
  const marksCompletedByKey = buildMarksCompletedMap(statusOptions);

  const counts: Record<SeoDashboardStatusBucket, number> = {
    completed:    0,
    needs_review: 0,
    in_progress:  0,
    pending:      0,
  };

  for (const task of tasks) {
    if (!task.status) continue;
    counts[resolveSeoTaskBucket(task.status, marksCompletedByKey)] += 1;
  }

  return BUCKET_ORDER.map(bucket => ({
    bucket,
    filterKey: primaryFilterKey(bucket, tasks, marksCompletedByKey, statusOptions),
    count:     counts[bucket],
    ...BUCKET_LABELS[bucket],
  }));
}

export function taskMatchesBucketFilter(
  task: SeoTask,
  bucket: SeoDashboardStatusBucket | '',
  marksCompletedByKey: Record<string, boolean>,
): boolean {
  if (!bucket) return true;
  if (!task.status) return false;
  return resolveSeoTaskBucket(task.status, marksCompletedByKey) === bucket;
}
