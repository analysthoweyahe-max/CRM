import type { ComboboxItem } from '@/shared/components/form/Combobox';

export interface TaskFiltersProps {
  statusItems:   ComboboxItem[];
  priorityItems: ComboboxItem[];
  projectItems:  ComboboxItem[];
  deadlineItems: ComboboxItem[];
  status:    string;
  priority:  string;
  project:   string;
  deadline:  string;
  onStatus:   (v: string) => void;
  onPriority: (v: string) => void;
  onProject:  (v: string) => void;
  onDeadline: (v: string) => void;
  isAr: boolean;
}
