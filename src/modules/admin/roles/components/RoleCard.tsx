import { Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { getRoleNameLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  role:       ApiRole;
  isAr:       boolean;
  isLocked:   boolean;
  onEdit:     () => void;
  onDelete:   () => void;
}

export function RoleCard({ role, isAr, isLocked, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="space-y-3 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
          {role.permissions.length} {isAr ? 'صلاحية' : 'permissions'}
        </span>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {getRoleNameLabel(role.name, isAr)}
        </h3>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-end font-mono flex-1">
        {role.name}
      </p>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" startIcon={<Pencil size={13} />} onClick={onEdit} disabled={isLocked} fullWidth>
          {isAr ? 'تعديل' : 'Edit'}
        </Button>
        <Button variant="danger" size="sm" startIcon={<Trash2 size={13} />} onClick={onDelete} disabled={isLocked} fullWidth>
          {isAr ? 'حذف' : 'Delete'}
        </Button>
      </div>
    </Card>
  );
}
