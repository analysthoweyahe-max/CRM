import { Briefcase, CheckSquare, Clock, Mail } from 'lucide-react';
import { Modal }   from '@/shared/components/ui/Modal';
import { Avatar }  from '@/shared/components/ui/Avatar';
import { getAllTasks } from '../../tasks/store/taskStore';
import type { MemberProfile } from '../types/project.types';

const STATUS_LABEL: Record<string, { ar: string; en: string; cls: string }> = {
  pending:    { ar: 'قيد الانتظار', en: 'Pending',     cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress',  cls: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]' },
  review:     { ar: 'مراجعة',      en: 'Review',       cls: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  completed:  { ar: 'مكتمل',       en: 'Completed',    cls: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
};

interface Props {
  member: MemberProfile | null;
  onClose: () => void;
  isAr:    boolean;
}

export function MemberProfileModal({ member, onClose, isAr }: Props) {
  if (!member) return null;

  const allTasks    = getAllTasks();
  const memberTasks = allTasks.filter(t => t.assigneeName === member.name);
  const activeTasks = memberTasks.filter(t => t.status !== 'completed');

  const activities = memberTasks
    .filter(t => t.estimatedHours)
    .slice(0, 6)
    .map(t => ({
      title:    t.title,
      hours:    t.estimatedHours ?? 0,
      project:  t.projectId,
      date:     t.dueDate,
    }));

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
          <Avatar initial={member.initial} color={member.color} size="lg"
            className="w-16! h-16! text-2xl!" />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{member.name}</p>
            {member.role && (
              <span className="inline-block text-xs px-3 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {member.role}
              </span>
            )}
            {member.email && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{member.email}</span>
                <Mail size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Briefcase size={18} className="text-[#A0CD39]" />, value: member.projectNames.length, label: isAr ? 'المشاريع' : 'Projects' },
            { icon: <CheckSquare size={18} className="text-[#A0CD39]" />, value: member.taskCount, label: isAr ? 'المهام' : 'Tasks' },
            { icon: <Clock size={18} className="text-[#A0CD39]" />, value: member.totalHours, label: isAr ? 'إجمالي الساعات' : 'Total Hours' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
              {stat.icon}
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Projects */}
        {member.projectNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'المشاريع' : 'Projects'}
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              {member.projectNames.map((name: string) => (
                <span key={name}
                  className="text-xs px-3 py-1 rounded-full border border-[#A0CD39]/40 bg-[#D8EBAE]/40 dark:bg-[#A0CD39]/10 text-[#709028] dark:text-[#A0CD39]">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active tasks */}
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'المهام المسندة' : 'Assigned Tasks'}
            </p>
            <div className="space-y-2">
              {activeTasks.slice(0, 4).map(task => {
                const s = STATUS_LABEL[task.status];
                return (
                  <div key={task.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>
                      {isAr ? s.ar : s.en}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-end truncate">{task.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity log */}
        {activities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'آخر النشاطات' : 'Recent Activity'}
            </p>
            <div className="space-y-2.5">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A0CD39] mt-1.5 shrink-0" />
                  <div className="flex-1 text-end">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {a.title}
                      <span className="text-gray-500 dark:text-gray-400 font-normal"> — {a.hours} {isAr ? 'س' : 'h'}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
