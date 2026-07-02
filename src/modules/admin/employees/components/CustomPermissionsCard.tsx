import { Card } from '@/shared/components/ui/Card';
import { PermissionChip } from '../../roles/components/PermissionChip';
import { MODULES, ACTION_LABELS } from '../../roles/data/roleData';
import type { PermissionAction } from '../../roles/types/adminRole.types';

interface Props {
  permissions: Record<string, PermissionAction[]>;
  isAr:        boolean;
}

export function CustomPermissionsCard({ permissions, isAr }: Props) {
  const grantedModules = MODULES.filter(mod => (permissions[mod.key]?.length ?? 0) > 0);

  return (
    <Card padding="lg">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
        {isAr ? 'الصلاحيات المخصصة' : 'Custom Permissions'}
      </h2>

      {grantedModules.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          {isAr ? 'لا توجد صلاحيات مخصصة' : 'No custom permissions'}
        </p>
      ) : (
        <div className="space-y-4">
          {grantedModules.map(mod => (
            <div key={mod.key} className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-end">
                {isAr ? mod.labelAr : mod.labelEn}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {permissions[mod.key]!.map(action => (
                  <PermissionChip key={action} label={isAr ? ACTION_LABELS[action].ar : ACTION_LABELS[action].en} active />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
