import { PermissionGroupList } from './PermissionGroupList';

interface Props {
  selected:  string[];
  onToggle:  (slug: string) => void;
  isAr:      boolean;
}

/** Multi-select permission picker — super-admin only. */
export function PermissionsPicker({ selected, onToggle, isAr }: Props) {
  return (
    <PermissionGroupList selected={selected} onToggle={onToggle} isAr={isAr} />
  );
}
