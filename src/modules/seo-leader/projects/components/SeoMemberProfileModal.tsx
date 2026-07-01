import { Briefcase, Mail, Building2, CheckSquare2, TrendingUp } from 'lucide-react';
import { Modal }   from '@/shared/components/ui/Modal';
import { Avatar }  from '@/shared/components/ui/Avatar';
import type { SeoProjectMember } from '../../team/types/seoTeam.types';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500',   'bg-violet-500', 'bg-amber-500',
  'bg-rose-500',    'bg-teal-500',  'bg-indigo-500', 'bg-orange-500',
];
function avatarColor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/* ── Read-only field ─────────────────────────────────────────────────── */
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

/* ── Stat card ───────────────────────────────────────────────────────── */
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

/* ── Modal ───────────────────────────────────────────────────────────── */
interface Props {
  member:  SeoProjectMember | null;
  onClose: () => void;
  isAr:    boolean;
}

export function SeoMemberProfileModal({ member, onClose, isAr }: Props) {
  if (!member) return null;

  const jobTitleName  = member.jobTitle?.name   ?? '—';
  const departmentName = member.department
    ? (isAr ? (member.department.nameAr || member.department.name) : member.department.name)
    : null;

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      title={isAr ? 'الملف الشخصي' : 'Member Profile'}
    >
      <div className="space-y-5 pb-1">

        {/* ── Avatar + name + role ── */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <Avatar
            initial={member.avatarInitial || member.name.charAt(0)}
            color={avatarColor(member.name)}
            size="lg"
          />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {member.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitleName}</p>
            <span className={`inline-block text-xs px-3 py-0.5 rounded-full font-medium
              ${member.isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
              {member.statusLabel || (isAr ? (member.isActive ? 'نشط' : 'غير نشط') : (member.isActive ? 'Active' : 'Inactive'))}
            </span>
          </div>
        </div>

        {/* ── Personal info fields ── */}
        <div className="space-y-3">
          <InfoField
            label={isAr ? 'البريد الإلكتروني' : 'Email'}
            value={member.email}
            icon={<Mail size={15} />}
          />
          <div className="grid grid-cols-2 gap-3">
            <InfoField
              label={isAr ? 'المسمى الوظيفي' : 'Job Title'}
              value={jobTitleName}
              icon={<Briefcase size={15} />}
            />
            {departmentName && (
              <InfoField
                label={isAr ? 'القسم' : 'Department'}
                value={departmentName}
                icon={<Building2 size={15} />}
              />
            )}
          </div>
          {(member.projectRole ?? member.role) && (
            <InfoField
              label={isAr ? 'الدور في المشروع' : 'Project Role'}
              value={member.projectRole ?? member.role}
              icon={<Briefcase size={15} />}
            />
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Briefcase size={18} />}
            value={member.activeProjectsCount}
            label={isAr ? 'المشاريع' : 'Projects'}
          />
          <StatCard
            icon={<CheckSquare2 size={18} />}
            value={member.projectTasksCount}
            label={isAr ? 'المهام' : 'Tasks'}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            value={`${member.tasksCompletionPercent ?? 0}%`}
            label={isAr ? 'نسبة الإنجاز' : 'Completion'}
          />
        </div>

      </div>
    </Modal>
  );
}
