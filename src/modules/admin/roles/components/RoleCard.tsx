import { Pencil } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { RoleDef } from '../types/adminRole.types';

interface Props {
  role:   RoleDef;
  isAr:   boolean;
  onEdit: () => void;
}

export function RoleCard({ role, isAr, onEdit }: Props) {
  return (
    <Card padding="lg" className="space-y-3 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
          {role.usersCount} {isAr ? 'مستخدمين' : 'users'}
        </span>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {isAr ? role.nameAr : role.nameEn}
        </h3>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-end leading-relaxed flex-1">
        {isAr ? role.descriptionAr : role.descriptionEn}
      </p>

      <Button variant="secondary" size="sm" startIcon={<Pencil size={13} />} onClick={onEdit} fullWidth>
        {isAr ? 'تعديل' : 'Edit'}
      </Button>
    </Card>
  );
}
