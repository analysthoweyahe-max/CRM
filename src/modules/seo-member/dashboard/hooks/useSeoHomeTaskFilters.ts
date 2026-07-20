import { useEffect, useMemo, useState } from 'react';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useClientPage } from '@/shared/hooks/useClientPage';
import {
  homeDeadlineItems,
  matchesHomeDeadline,
  type HomeDeadlineFilter,
} from '@/shared/modules/my-tasks/utils/homeTaskDeadline.utils';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';
import {
  buildMarksCompletedMap,
  taskMatchesBucketFilter,
  type SeoDashboardStatusBucket,
} from '../utils/seoTaskStatusBuckets.utils';
import type { SeoTaskStatusOption } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';

const PAGE_SIZE = 10;

interface UseSeoHomeTaskFiltersOptions {
  /** Raw status key driven from the combobox or a stat card with a single matching key. */
  externalStatus?: string;
  /** Bucket filter driven from a stat card click. */
  externalBucket?: SeoDashboardStatusBucket | '';
  statusOptions?: SeoTaskStatusOption[];
}

export function useSeoHomeTaskFilters(
  tasks: SeoTask[],
  isAr: boolean,
  options?: UseSeoHomeTaskFiltersOptions,
) {
  const [status, setStatus]     = useState(options?.externalStatus ?? '');
  const [project, setProject]   = useState('');
  const [deadline, setDeadline] = useState<HomeDeadlineFilter>('');

  const marksCompletedByKey = useMemo(
    () => buildMarksCompletedMap(options?.statusOptions ?? []),
    [options?.statusOptions],
  );

  useEffect(() => {
    if (options?.externalStatus !== undefined) {
      setStatus(options.externalStatus);
    }
  }, [options?.externalStatus]);

  const statusItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.status) map.set(t.status, t.statusLabel || t.status);
    }
    return [
      { id: '', label: isAr ? 'كل الحالات' : 'All Statuses' },
      ...[...map.entries()].map(([id, label]) => ({ id, label })),
    ];
  }, [tasks, isAr]);

  const projectItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.project?.id) map.set(t.project.id, t.project.name);
    }
    return [
      { id: '', label: isAr ? 'كل المشاريع' : 'All Projects' },
      ...[...map.entries()].map(([id, label]) => ({ id, label })),
    ];
  }, [tasks, isAr]);

  const deadlineItems = useMemo(() => homeDeadlineItems(isAr), [isAr]);

  const filtered = useMemo(() => {
    const bucket = options?.externalBucket ?? '';
    return tasks.filter((task) => {
      if (bucket) {
        if (!taskMatchesBucketFilter(task, bucket, marksCompletedByKey)) return false;
      } else if (status && task.status !== status) {
        return false;
      }
      if (project && task.project?.id !== project) return false;
      if (!matchesHomeDeadline(task.dueDate || task.dueAt, deadline, {
        isOverdue: task.isOverdue,
        isDelayed: task.isDelayed,
      })) return false;
      return true;
    });
  }, [tasks, status, project, deadline, options?.externalBucket, marksCompletedByKey]);

  const pagination = useClientPage(filtered, PAGE_SIZE);

  function onStatus(value: string) {
    setStatus(value);
    pagination.resetPage();
  }

  function onProject(value: string) {
    setProject(value);
    pagination.resetPage();
  }

  function onDeadline(value: string) {
    setDeadline(value as HomeDeadlineFilter);
    pagination.resetPage();
  }

  return {
    status,
    project,
    deadline,
    statusItems,
    projectItems,
    deadlineItems,
    onStatus,
    onProject,
    onDeadline,
    filtered,
    ...pagination,
  };
}
