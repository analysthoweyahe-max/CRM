import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, Building2, Mail } from 'lucide-react';
import { useLang }  from '@/app/providers/LanguageProvider';
import { ROUTES }   from '@/app/router/routes';
import { Card }     from '@/shared/components/ui/Card';
import { Avatar }   from '@/shared/components/ui/Avatar';
import { getAvatarColor } from '@/shared/utils';
import { useProjectTeamMember } from '../hooks/useProjectTeamMember';
import type { PmTeamMemberApi } from '../types/team.types';

export function ProjectTeamMemberPage() {
  const { id }          = useParams<{ id: string }>();
  const { lang, isRTL } = useLang();
  const isAr            = lang === 'ar';
  const navigate        = useNavigate();
  const location        = useLocation();

  const initial = (location.state as { member?: PmTeamMemberApi } | null)?.member ?? null;
  const { member, isLoading } = useProjectTeamMember(id, initial);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const color = member ? getAvatarColor(member.id) : '';

  const stats = member
    ? [
        {
          icon:  <Briefcase size={18} className="text-[#A0CD39]" />,
          value: member.activeProjectsLabel,
          label: isAr ? 'المشاريع النشطة' : 'Active Projects',
        },
        {
          icon:  <Building2 size={18} className="text-[#A0CD39]" />,
          value: member.department,
          label: isAr ? 'القسم' : 'Department',
        },
      ]
    : [];

  const dash = isAr ? '—' : '—';
  const profilePath = member ? ROUTES.PROJECT_MANAGER.TEAM_MEMBER(member.id) : '';
  const details = member
    ? [
        { label: isAr ? 'المعرّف' : 'ID', value: member.id || dash },
        { label: isAr ? 'الاسم' : 'Name', value: member.name || dash },
        { label: isAr ? 'البريد الإلكتروني' : 'Email', value: member.email || dash },
        { label: isAr ? 'المسمى الوظيفي' : 'Job Title', value: member.jobTitle || dash },
        { label: isAr ? 'القسم' : 'Department', value: member.department || dash },
        { label: isAr ? 'الحالة' : 'Status', value: member.statusLabel || member.status || dash },
        { label: isAr ? 'المشاريع النشطة' : 'Active Projects', value: String(member.activeProjectsCount ?? dash) },
        {
          label: isAr ? 'رابط الملف' : 'Profile URL',
          value: profilePath
            ? <a href={profilePath}
                 className="text-[#709028] dark:text-[#A0CD39] hover:underline">{profilePath}</a>
            : dash,
        },
      ]
    : [];

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.TEAM)}
          className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isAr ? 'رجوع' : 'Back'}
        >
          <BackIcon size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'الملف الشخصي للعضو' : 'Member Profile'}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : !member ? (
        <div className="text-center py-16 text-sm text-gray-400">
          {isAr ? 'العضو غير موجود' : 'Member not found'}
        </div>
      ) : (
        <Card padding="lg" className="space-y-5">

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
                member.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400',
              ].join(' ')}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${member.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
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
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                  {s.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>

          {/* All member data */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 text-end">
              {isAr ? 'كل البيانات' : 'All Data'}
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {details.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="text-sm text-gray-800 dark:text-gray-200 text-end break-all min-w-0">
                    {row.value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{row.label}</span>
                </div>
              ))}
            </div>
          </div>

        </Card>
      )}
    </div>
  );
}
