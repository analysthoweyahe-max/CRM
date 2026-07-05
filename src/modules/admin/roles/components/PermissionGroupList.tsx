import { PermissionChip } from './PermissionChip';
import { PERMISSION_GROUPS } from '../types/adminRole.types';

interface Props {
  selected: string[];
  onToggle: (slug: string) => void;
  isAr:     boolean;
}

export function PermissionGroupList({ selected, onToggle, isAr }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.key} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {group.slugs.map(({ slug, labelAr, labelEn }) => (
              <PermissionChip
                key={slug}
                label={isAr ? labelAr : labelEn}
                active={selected.includes(slug)}
                onToggle={() => onToggle(slug)}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            {isAr ? group.labelAr : group.labelEn}
          </span>
        </div>
      ))}
    </div>
  );
}
