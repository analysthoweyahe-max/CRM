import { Combobox } from '@/shared/components/form/Combobox';

interface Props {
  isAr:            boolean;
  projectId:       string;
  onProjectChange: (id: string) => void;
  projects:        { id: number | string; name: string }[];
}

export function MyTasksProjectFilter({
  isAr,
  projectId,
  onProjectChange,
  projects,
}: Props) {
  if (projects.length === 0) return null;

  const items = [
    { id: '', label: isAr ? 'كل المشاريع' : 'All projects' },
    ...projects.map((p) => ({ id: String(p.id), label: p.name })),
  ];

  return (
    <div className="max-w-xs">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {isAr ? 'المشروع' : 'Project'}
      </label>
      <Combobox
        value={projectId}
        onChange={onProjectChange}
        items={items}
        placeholder={isAr ? 'كل المشاريع' : 'All projects'}
      />
    </div>
  );
}
