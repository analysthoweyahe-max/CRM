import { Badge } from './Badge';
import { getPermissionLabel } from '@/shared/permissions/permissionLabel.utils';

interface Props {
  permissions: string[];
  isAr:        boolean;
}

/** Read-only tag list of effective permission slugs, e.g. on an employee detail page. */
export function PermissionTagList({ permissions, isAr }: Props) {
  if (permissions.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        {isAr ? 'لا توجد صلاحيات فعّالة' : 'No effective permissions'}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {permissions.map((slug) => (
        <Badge key={slug} label={getPermissionLabel(slug, isAr)} variant="gray" />
      ))}
    </div>
  );
}
