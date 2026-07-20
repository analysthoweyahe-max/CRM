import { useMemo, useState } from 'react';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import {
  matchesTaskPeriod,
  type TaskPeriodFilter,
} from '@/modules/project-manager/projects/utils/kanbanTaskFilters.utils';
import type { GroupedTasksData, MyTask } from '../types/myTasks.types';

const UNASSIGNED = '__unassigned__';
const UNKNOWN_CREATOR = '__unknown_creator__';

export function useMyTasksBoardFilters(allTasks: MyTask[], isAr: boolean) {
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [creatorFilter,  setCreatorFilter]  = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [periodFilter,   setPeriodFilter]   = useState<TaskPeriodFilter>('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');

  const assigneeItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const t of allTasks) {
      if (t.assignee?.id) {
        map.set(t.assignee.id, { id: t.assignee.id, label: t.assignee.name || t.assignee.id });
      }
    }
    const items = [
      { id: '', label: isAr ? 'كل المسؤولين' : 'All assignees' },
      ...Array.from(map.values()),
    ];
    if (allTasks.some(t => !t.assignee?.id)) {
      items.push({ id: UNASSIGNED, label: isAr ? 'بدون مسؤول' : 'Unassigned' });
    }
    return items;
  }, [allTasks, isAr]);

  const creatorItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const t of allTasks) {
      if (t.createdById) {
        map.set(t.createdById, {
          id: t.createdById,
          label: t.createdByName || t.createdById,
        });
      }
    }
    const items = [
      { id: '', label: isAr ? 'كل المنشئين' : 'All creators' },
      ...Array.from(map.values()),
    ];
    if (allTasks.some(t => !t.createdById)) {
      items.push({ id: UNKNOWN_CREATOR, label: isAr ? 'غير معروف' : 'Unknown' });
    }
    return items;
  }, [allTasks, isAr]);

  const statusItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const t of allTasks) {
      if (t.status) {
        map.set(t.status, {
          id: t.status,
          label: translateProjectLookup(t.status, t.statusLabel || t.status, isAr),
        });
      }
    }
    return [
      { id: '', label: isAr ? 'كل الحالات' : 'All statuses' },
      ...Array.from(map.values()),
    ];
  }, [allTasks, isAr]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (assigneeFilter === UNASSIGNED) return !t.assignee?.id;
      if (assigneeFilter && t.assignee?.id !== assigneeFilter) return false;
      if (creatorFilter === UNKNOWN_CREATOR) return !t.createdById;
      if (creatorFilter && t.createdById !== creatorFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (!matchesTaskPeriod(t.createdAt, periodFilter, dateFrom, dateTo)) return false;
      return true;
    });
  }, [
    allTasks, assigneeFilter, creatorFilter, statusFilter,
    periodFilter, dateFrom, dateTo,
  ]);

  const hasActiveFilters = !!assigneeFilter || !!creatorFilter || !!statusFilter || !!periodFilter;

  function clearFilters() {
    setAssigneeFilter('');
    setCreatorFilter('');
    setStatusFilter('');
    setPeriodFilter('');
    setDateFrom('');
    setDateTo('');
  }

  function setPeriod(value: TaskPeriodFilter) {
    setPeriodFilter(value);
    if (value !== 'custom') {
      setDateFrom('');
      setDateTo('');
    }
  }

  function filterGroupedData(data: GroupedTasksData): GroupedTasksData {
    const filteredIds = new Set(filteredTasks.map(t => t.id));
    let columns = data.columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => filteredIds.has(t.id)),
    }));
    if (statusFilter) {
      const matched = columns.filter(c => c.status === statusFilter);
      columns = matched.length > 0
        ? matched
        : [{
            status: statusFilter,
            statusLabel: statusItems.find(s => s.id === statusFilter)?.label || statusFilter,
            tasks: filteredTasks.filter(t => t.status === statusFilter),
          }];
    }
    return {
      ...data,
      columns,
      total: filteredTasks.length,
    };
  }

  return {
    assigneeFilter,
    creatorFilter,
    statusFilter,
    periodFilter,
    dateFrom,
    dateTo,
    assigneeItems,
    creatorItems,
    statusItems,
    filteredTasks,
    hasActiveFilters,
    setAssigneeFilter,
    setCreatorFilter,
    setStatusFilter,
    setPeriod,
    setDateFrom,
    setDateTo,
    clearFilters,
    filterGroupedData,
  };
}
