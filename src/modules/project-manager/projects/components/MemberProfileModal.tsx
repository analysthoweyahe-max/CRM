import { Briefcase, Mail, Building2, CheckSquare2 } from 'lucide-react';
import { Modal }   from '@/shared/components/ui/Modal';
import { Avatar }  from '@/shared/components/ui/Avatar';
import { getAvatarColor } from '@/shared/utils';
import type { PmProjectTeamListMember } from '../types/project.types';

function InfoField({
  label, value, icon,
}: { label: string; value?: string | null; icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 text-end">
        {label}
      </label>
      <div className="flex items-center justify-end gap-2.5
                      rounded-xl border border-gray-200 dark:border-gray-600
                      bg-gray-50 dark:bg-gray-700/50
                      px-3.5 py-2.5 min-h-[42px]">
        <span className="text-sm text-gray-700 dark:text-gray-200 truncate text-end flex-1">
          {value || '—'}
        </span>
        <span className="text-gray-400 dark:text-gray-500 shrink-0">{icon}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon, value, label,
}: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5
                    bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <span className="text-[#A0CD39]">{icon}</span>
      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

interface Props {
  member:  PmProjectTeamListMember | null;
  onClose: () => void;
  isAr:    boolean;
}

export function MemberProfileModal({ member, onClose, isAr }: Props) {
  if (!member) return null;

  const isActive = member.status === 'active';

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      title={isAr ? 'الملف الشخصي' : 'Member Profile'}
    >
      <div className="space-y-5 pb-1">

        {/* Avatar + name + role */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <Avatar initial={member.avatarInitial} color={getAvatarColor(member.id)} size="lg" />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.jobTitle || '—'}</p>
            <span className={`inline-block text-xs px-3 py-0.5 rounded-full font-medium
              ${isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
              {isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
            </span>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-3">
          <InfoField
            label={isAr ? 'البريد الإلكتروني' : 'Email'}
            value={member.email}
            icon={<Mail size={15} />}
          />
          <div className="grid grid-cols-2 gap-3">
            <InfoField
              label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
              value={member.jobTitle}
              icon={<Briefcase size={15} />}
            />
            <InfoField
              label={isAr ? 'القسم' : 'Department'}
              value={member.department}
              icon={<Building2 size={15} />}
            />
          </div>
          {member.projectRole && (
            <InfoField
              label={isAr ? 'الدور في المشروع' : 'Project Role'}
              value={member.projectRole}
              icon={<Briefcase size={15} />}
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1">
          <StatCard
            icon={<CheckSquare2 size={18} />}
            value={member.projectTasksCount}
            label={isAr ? 'المهام في المشروع' : 'Project Tasks'}
          />
        </div>

      </div>
    </Modal>
  );
}
