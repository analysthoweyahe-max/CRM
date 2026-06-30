import { Briefcase, CheckSquare, Mail, Phone } from 'lucide-react';
import { Modal }   from '@/shared/components/ui/Modal';
import { Avatar }  from '@/shared/components/ui/Avatar';
import type { SeoTeamApiMember } from '../hooks/useSeoTeamPage';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500',   'bg-violet-500', 'bg-amber-500',
  'bg-rose-500',    'bg-teal-500',  'bg-indigo-500', 'bg-orange-500',
];

function avatarColor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface Props {
  member:  SeoTeamApiMember | null;
  onClose: () => void;
  isAr:    boolean;
}

export function SeoMemberProfileModal({ member, onClose, isAr }: Props) {
  if (!member) return null;

  const color  = avatarColor(member.name);
  const isActive = member.isActive;

  const stats = [
    {
      icon:  <Briefcase   size={18} className="text-[#A0CD39]" />,
      value: member.activeProjectsCount,
      label: isAr ? 'المشاريع النشطة' : 'Active Projects',
    },
    {
      icon:  <CheckSquare size={18} className="text-[#A0CD39]" />,
      value: member.jobTitle?.name ?? '—',
      label: isAr ? 'المسمى الوظيفي' : 'Job Title',
      isText: true,
    },
  ];

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      title={isAr ? 'الملف الشخصي للعضو' : 'Member Profile'}
      size="lg"
    >
      <div className="space-y-5 pb-2">

        {/* Avatar + name + role + contact */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <Avatar initial={member.avatarInitial} color={color} size="lg"
            className="w-16! h-16! text-2xl!" />
          <div className="text-center space-y-1.5">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{member.name}</p>

            {/* Status */}
            <span className={[
              'inline-flex items-center gap-1 text-xs px-3 py-0.5 rounded-full',
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
            ].join(' ')}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {member.statusLabel}
            </span>

            {/* Team */}
            {member.team?.nameAr && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{member.team.nameAr}</p>
            )}

            {/* Email */}
            {member.email && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{member.email}</span>
                <Mail size={12} />
              </div>
            )}

            {/* Phone */}
            {member.phone && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span dir="ltr">{member.phone}</span>
                <Phone size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
              {s.icon}
              <span className={s.isText
                ? 'text-sm font-semibold text-gray-900 dark:text-gray-100 text-center'
                : 'text-xl font-bold text-gray-900 dark:text-gray-100'
              }>
                {s.value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </Modal>
  );
}
