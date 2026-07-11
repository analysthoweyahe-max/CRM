import { Eye, Mail, Trash2 } from 'lucide-react';
import { Avatar }            from '@/shared/components/ui/Avatar';
import { Button }            from '@/shared/components/ui/Button';

export interface ProjectMemberCardData {
  id:        string;
  initial:   string;
  color:     string;
  name:      string;
  role?:     string;
  email?:    string;
  isActive:  boolean;
  taskCount: number;
}

interface Props {
  member:    ProjectMemberCardData;
  onRemove?: (id: string) => void;
  onView:    (id: string) => void;
  isAr:      boolean;
}

export function ProjectMemberCard({ member, onRemove, onView, isAr }: Props) {
  return (
    <div className="
      bg-white dark:bg-gray-800
      rounded-2xl border border-gray-100 dark:border-gray-700
      p-4 space-y-3
      transition-all duration-200
      hover:border-[#A0CD39]/60 hover:shadow-[0_0_0_1px_rgba(160,205,57,0.25)] hover:-translate-y-0.5
    ">

      {/* Avatar + Name + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col items-end gap-1.5 flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {member.role && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {member.role}
              </span>
            )}
            <span className={[
              'text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1',
              member.isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
            ].join(' ')}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${member.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {member.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
            </span>
          </div>
        </div>
        <Avatar initial={member.initial} color={member.color} size="lg" />
      </div>

      {/* Email */}
      {member.email && (
        <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>{member.email}</span>
          <Mail size={12} className="shrink-0" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1">
          {onRemove && (
            <Button variant="icon-danger" onClick={() => onRemove(member.id)}>
              <Trash2 size={14} />
            </Button>
          )}
          <Button variant="icon-brand" onClick={() => onView(member.id)}>
            <Eye size={14} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isAr ? 'المهام:' : 'Tasks:'}
          <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">{member.taskCount}</span>
        </p>
      </div>

    </div>
  );
}
