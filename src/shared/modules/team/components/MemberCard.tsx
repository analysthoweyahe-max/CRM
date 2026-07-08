import { Eye, Power } from 'lucide-react';
import { Avatar }     from '@/shared/components/ui/Avatar';
import { Button }     from '@/shared/components/ui/Button';

export interface MemberCardData {
  id:           string;
  initial:      string;
  color:        string;
  name:         string;
  role?:        string;
  email?:       string;
  isActive?:    boolean;
  projectCount: number;
}

interface Props {
  member:         MemberCardData;
  selected:       boolean;
  onToggle:       (id: string) => void;
  onView:         (id: string) => void;
  onToggleActive: (id: string) => void;
  isAr:           boolean;
}

export function MemberCard({ member, selected, onToggle, onView, onToggleActive, isAr }: Props) {
  const isActive = member.isActive !== false;

  return (
    <div
      onClick={() => onView(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(member.id); } }}
      className={[
      'relative bg-white dark:bg-gray-800 rounded-2xl border p-4 space-y-3 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A0CD39]',
      selected
        ? 'border-[#A0CD39] shadow-[0_0_0_1px_rgba(160,205,57,0.5)]'
        : 'border-gray-100 dark:border-gray-700 hover:border-[#A0CD39]/60 hover:shadow-[0_0_0_1px_rgba(160,205,57,0.25)]',
    ].join(' ')}>

      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(member.id)}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3.5 start-3.5 w-4 h-4 rounded accent-[#A0CD39] cursor-pointer"
      />

      <div className="flex justify-center pt-1">
        <Avatar initial={member.initial} color={member.color} size="lg"
          className="w-14! h-14! text-xl!" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
        {member.role && (
          <span className="inline-block text-xs px-3 py-0.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            {member.role}
          </span>
        )}
      </div>

      {member.email && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 truncate px-2">
          {member.email}
        </p>
      )}

      <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 space-y-2.5">

        <div className="flex items-center justify-between">
          <span className={[
            'text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1',
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
          ].join(' ')}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? 'المشاريع:' : 'Projects:'}
            <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">{member.projectCount}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="icon" title={isAr ? 'تبديل الحالة' : 'Toggle status'}
            onClick={(e) => { e.stopPropagation(); onToggleActive(member.id); }}>
            <Power size={14} />
          </Button>
          <Button variant="secondary" size="sm" startIcon={<Eye size={13} />}
            onClick={(e) => { e.stopPropagation(); onView(member.id); }}>
            {isAr ? 'عرض الملف' : 'View Profile'}
          </Button>
        </div>

      </div>
    </div>
  );
}
