import type { ComboboxItem } from '@/shared/components/form/Combobox';

export type HomeDeadlineFilter = '' | 'overdue' | 'week' | 'month';

export function homeDeadlineItems(isAr: boolean): ComboboxItem[] {
  return [
    { id: '',        label: isAr ? 'كل المواعيد'   : 'All deadlines' },
    { id: 'overdue', label: isAr ? 'متأخرة'        : 'Overdue' },
    { id: 'week',    label: isAr ? 'هذا الأسبوع'  : 'This week' },
    { id: 'month',   label: isAr ? 'هذا الشهر'   : 'This month' },
  ];
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Match overdue / this-week / this-month against a task due date (or overdue flags). */
export function matchesHomeDeadline(
  dueDate: string | null | undefined,
  filter: HomeDeadlineFilter,
  flags?: { isOverdue?: boolean; isDelayed?: boolean },
): boolean {
  if (!filter) return true;

  if (filter === 'overdue') {
    if (flags?.isOverdue || flags?.isDelayed) return true;
    const dl = parseDeadline(dueDate);
    if (!dl) return false;
    return dl < startOfToday();
  }

  const dl = parseDeadline(dueDate);
  if (!dl) return false;

  const today = startOfToday();

  if (filter === 'week') {
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return dl >= today && dl <= end;
  }

  if (filter === 'month') {
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return dl >= today && dl <= end;
  }

  return true;
}
