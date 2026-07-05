import { Card } from '@/shared/components/ui/Card';
import { PermissionChip } from './PermissionChip';
import { PERMISSION_GROUPS, getRoleNameLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  roles: ApiRole[];
  isAr:  boolean;
}

export function PermissionMatrixTable({ roles, isAr }: Props) {
  return (
    <Card overflow>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-5 py-3 text-end text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {isAr ? 'الوحدة' : 'Module'}
              </th>
              {roles.map((r) => (
                <th key={r.id} className="px-5 py-3 text-end text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {getRoleNameLabel(r.name, isAr)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {PERMISSION_GROUPS.map((group) => (
              <tr key={group.key}>
                <td className="px-5 py-3.5 text-end font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {isAr ? group.labelAr : group.labelEn}
                </td>
                {roles.map((r) => (
                  <td key={r.id} className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {group.slugs.map(({ slug, labelAr, labelEn }) => (
                        <PermissionChip
                          key={slug}
                          label={isAr ? labelAr : labelEn}
                          active={r.permissions.includes(slug)}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
