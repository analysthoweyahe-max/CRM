import { Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge }  from '@/shared/components/ui/Badge';
import type { ApiPayrollAdjustmentType } from '../types/payroll.types';

interface Props {
  item:     ApiPayrollAdjustmentType;
  isAr:     boolean;
  onEdit:   () => void;
  onDelete: () => void;
}

export function PayrollTypeCard({ item, isAr, onEdit, onDelete }: Props) {
  const title = isAr
    ? (item.label || item.nameAr || item.name)
    : (item.name || item.label || item.nameAr);

  const sourceLabel = item.sourceLabel
    || (item.source === 'automatic'
      ? (isAr ? 'تلقائي' : 'Automatic')
      : (isAr ? 'يدوي' : 'Manual'));

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-start gap-1">
        <Button
          variant="icon-danger"
          aria-label={isAr ? 'حذف النوع' : 'Delete type'}
          onClick={onDelete}
          disabled={item.isSystem}
          title={item.isSystem ? (isAr ? 'لا يمكن حذف الأنواع النظامية' : 'System types cannot be deleted') : undefined}
        >
          <Trash2 size={15} />
        </Button>
        <Button
          variant="icon"
          aria-label={isAr ? 'تعديل النوع' : 'Edit type'}
          onClick={onEdit}
        >
          <Pencil size={15} />
        </Button>
      </div>

      <div className="text-start">
        <div className="flex justify-start mb-1.5">
          <Badge
            label={sourceLabel}
            variant={item.source === 'automatic' ? 'brand' : 'gray'}
          />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
          {title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all mt-0.5" dir="ltr">
          {item.code}
        </p>
        <div className="flex items-center justify-start gap-1.5 mt-2 flex-wrap">
          {item.isSystem && <Badge label={isAr ? 'نظامي' : 'System'} variant="gray" />}
          {!item.isActive && <Badge label={isAr ? 'معطّل' : 'Inactive'} variant="error" />}
          <Badge label={`#${item.sortOrder}`} variant="gray" />
        </div>
      </div>
    </Card>
  );
}
