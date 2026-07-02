import { Briefcase, Building2, Mail } from 'lucide-react';
import { Modal }  from '@/shared/components/ui/Modal';
import { Avatar } from '@/shared/components/ui/Avatar';
import { getAvatarColor } from '@/shared/utils';
import type { PmTeamMemberApi } from '../hooks/useProjectTeamPage';

interface Props {
  member:  PmTeamMemberApi | null;
  onClose: () => void;
  isAr:    boolean;
}

export function PmMemberProfileModal({ member, onClose, isAr }: Props) {
  if (!member) return null;

  const color    = getAvatarColor(member.id);
  const isActive = member.isActive;

  const stats = [
    {
      icon:  <Briefcase size={18} className="text-[#A0CD39]" />,
      value: member.activeProjectsLabel,
      label: isAr ? 'المشاريع النشطة' : 'Active Projects',
      isText: true,
    },
    {
      icon:  <Building2 size={18} className="text-[#A0CD39]" />,
      value: member.department,
      label: isAr ? 'القسم' : 'Department',
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

        {/* Avatar + name + role + email */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <Avatar initial={member.avatarInitial} color={color} size="lg"
            className="w-16! h-16! text-2xl!" />
          <div className="text-center space-y-1.5">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{member.name}</p>

            {member.jobTitle && (
              <span className="inline-block text-xs px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {member.jobTitle}
              </span>
            )}

            <span className={[
              'flex items-center justify-center gap-1 text-xs px-3 py-0.5 rounded-full w-fit mx-auto',
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
            ].join(' ')}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {member.statusLabel}
            </span>

            {member.email && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{member.email}</span>
                <Mail size={12} />
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
