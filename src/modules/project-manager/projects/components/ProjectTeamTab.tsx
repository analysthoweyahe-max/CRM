import { Mail, Briefcase } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { getAvatarColor } from '@/shared/utils';
import type { PmProjectTeamMember } from '../types/project.types';

interface Props {
  team: PmProjectTeamMember[];
  isAr: boolean;
}

export function ProjectTeamTab({ team, isAr }: Props) {
  if (team.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
        {isAr ? 'لم يتم تعيين أعضاء لهذا المشروع بعد' : 'No members assigned to this project yet'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {team.map(member => (
        <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col items-end gap-1.5 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {member.projectRole && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20 text-[#709028] dark:text-[#A0CD39]">
                    {member.projectRole}
                  </span>
                )}
                <span className={[
                  'text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1',
                  member.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
                ].join(' ')}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {member.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                </span>
              </div>
            </div>
            <Avatar initial={member.avatarInitial} color={getAvatarColor(member.id)} size="lg" />
          </div>

          <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-2.5">
            {member.jobTitle && (
              <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{member.jobTitle}{member.department ? ` · ${member.department}` : ''}</span>
                <Briefcase size={12} className="shrink-0" />
              </div>
            )}
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>{member.email}</span>
              <Mail size={12} className="shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
