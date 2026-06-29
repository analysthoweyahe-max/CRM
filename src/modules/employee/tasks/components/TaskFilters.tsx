import { Combobox } from '@/shared/components/form/Combobox';
import type { TaskFiltersProps } from './TaskFilters.types';

export function TaskFilters({
  statusItems, priorityItems, projectItems, deadlineItems,
  status, priority, project, deadline,
  onStatus, onPriority, onProject, onDeadline,
  isAr,
}: TaskFiltersProps) {
  const sp = isAr ? 'ابحث...' : 'Search...';
  const nr = isAr ? 'لا نتائج' : 'No results';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Combobox
        items={statusItems} value={status} onChange={onStatus}
        searchPlaceholder={sp} noResultsText={nr}
      />
      <Combobox
        items={priorityItems} value={priority} onChange={onPriority}
        searchPlaceholder={sp} noResultsText={nr}
      />
      <Combobox
        items={projectItems} value={project} onChange={onProject}
        searchPlaceholder={sp} noResultsText={nr}
      />
      <Combobox
        items={deadlineItems} value={deadline} onChange={onDeadline}
        searchPlaceholder={sp} noResultsText={nr}
      />
    </div>
  );
}
