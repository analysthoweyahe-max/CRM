import { Combobox } from '@/shared/components/form/Combobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

interface Props {
  statusItems:   ComboboxItem[];
  projectItems:  ComboboxItem[];
  deadlineItems: ComboboxItem[];
  status:   string;
  project:  string;
  deadline: string;
  onStatus:   (v: string) => void;
  onProject:  (v: string) => void;
  onDeadline: (v: string) => void;
  isAr: boolean;
}

export function HomeTaskFilters({
  statusItems, projectItems, deadlineItems,
  status, project, deadline,
  onStatus, onProject, onDeadline,
  isAr,
}: Props) {
  const sp = isAr ? 'ابحث...' : 'Search...';
  const nr = isAr ? 'لا نتائج' : 'No results';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Combobox
        items={statusItems}
        value={status}
        onChange={onStatus}
        placeholder={isAr ? 'الحالة' : 'Status'}
        searchPlaceholder={sp}
        noResultsText={nr}
      />
      <Combobox
        items={projectItems}
        value={project}
        onChange={onProject}
        placeholder={isAr ? 'المشروع' : 'Project'}
        searchPlaceholder={sp}
        noResultsText={nr}
      />
      <Combobox
        items={deadlineItems}
        value={deadline}
        onChange={onDeadline}
        placeholder={isAr ? 'الموعد' : 'Deadline'}
        searchPlaceholder={sp}
        noResultsText={nr}
      />
    </div>
  );
}
