import { Users, Building2, User, Megaphone } from 'lucide-react';
import { Card }  from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import type { ApiAdminInstruction } from '../types/instruction.types';

interface Props {
  history:   ApiAdminInstruction[];
  isLoading: boolean;
  isAr:      boolean;
}

function audienceLabel(ins: ApiAdminInstruction, isAr: boolean) {
  if (ins.audienceType === 'all') return isAr ? 'كل الموظفين' : 'All Employees';
  if (ins.audienceType === 'department') return ins.departmentName ?? (isAr ? 'قسم' : 'Department');
  if (ins.audienceType === 'managers') return isAr ? 'مديرين' : 'Managers';
  return ins.employeeName ?? (isAr ? 'موظف' : 'Employee');
}

function AudienceIcon({ type }: { type: ApiAdminInstruction['audienceType'] }) {
  if (type === 'all' || type === 'managers') return <Users size={13} />;
  if (type === 'department') return <Building2 size={13} />;
  return <User size={13} />;
}

export function InstructionsHistoryList({ history, isLoading, isAr }: Props) {
  return (
    <Card padding="lg" className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {isAr ? 'سجل التعليمات المرسلة' : 'Sent Instructions History'}
      </h3>

      {isLoading ? (
        <div className="text-center py-10 text-sm text-gray-400">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
          <Megaphone size={22} className="text-gray-300" />
          {isAr ? 'لم يتم إرسال أي تعليمات بعد' : 'No instructions sent yet'}
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto">
          {history.map((ins) => (
            <div key={ins.id} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{ins.title}</h4>
                <Badge
                  label={audienceLabel(ins, isAr)}
                  variant="gray"
                  icon={<AudienceIcon type={ins.audienceType} />}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{ins.body}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{ins.createdAt}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
