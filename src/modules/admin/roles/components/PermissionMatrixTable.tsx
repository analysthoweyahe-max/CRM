import { Card } from '@/shared/components/ui/Card';
import { PermissionChip } from './PermissionChip';
import { MODULES, ACTION_LABELS } from '../data/roleData';
import type { RoleDef, PermissionMatrix, PermissionAction } from '../types/adminRole.types';

interface Props {
  roles:    RoleDef[];
  matrix:   PermissionMatrix;
  onToggle: (roleKey: string, moduleKey: string, action: PermissionAction) => void;
  isAr:     boolean;
}

export function PermissionMatrixTable({ roles, matrix, onToggle, isAr }: Props) {
  return (
    <Card overflow>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-5 py-3 text-end text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {isAr ? 'الوحدة' : 'Module'}
              </th>
              {roles.map(r => (
                <th key={r.key} className="px-5 py-3 text-end text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {isAr ? r.nameAr : r.nameEn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {MODULES.map(mod => (
              <tr key={mod.key}>
                <td className="px-5 py-3.5 text-end font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {isAr ? mod.labelAr : mod.labelEn}
                </td>
                {roles.map(r => (
                  <td key={r.key} className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {mod.actions.map(action => (
                        <PermissionChip
                          key={action}
                          label={isAr ? ACTION_LABELS[action].ar : ACTION_LABELS[action].en}
                          active={matrix[r.key]?.[mod.key]?.includes(action) ?? false}
                          onToggle={() => onToggle(r.key, mod.key, action)}
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
