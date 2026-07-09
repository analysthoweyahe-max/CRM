import type { ReactNode } from 'react';
import {
  FileText, Tag, Activity, Calendar, CalendarCheck,
  Link2, User, Users, Layers,
} from 'lucide-react';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { ensureHttpUrl } from '@/shared/utils';
import type { PmProjectDetails } from '../types/project.types';

interface Props {
  project: PmProjectDetails;
  isAr:    boolean;
}

interface RowProps {
  icon:     ReactNode;
  label:    string;
  children: ReactNode;
}

function Row({ icon, label, children }: RowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <span className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <div className="text-sm text-gray-800 dark:text-gray-100 break-words">{children}</div>
      </div>
    </div>
  );
}

export function ProjectDetailsContent({ project, isAr }: Props) {
  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <Row icon={<FileText size={16} />} label={isAr ? 'الوصف' : 'Description'}>
        {project.description
          ? project.description
          : <span className="text-gray-400">{isAr ? 'لا يوجد وصف' : 'No description'}</span>}
      </Row>

      <Row icon={<Tag size={16} />} label={isAr ? 'نوع المشروع' : 'Project Type'}>
        {translateProjectLookup(project.projectType, project.projectTypeLabel, isAr)}
      </Row>

      <Row icon={<Activity size={16} />} label={isAr ? 'الحالة' : 'Status'}>
        {translateProjectLookup(project.status, project.statusLabel, isAr)}
        {project.isDraft && (
          <span className="ms-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {isAr ? 'مسودة' : 'Draft'}
          </span>
        )}
      </Row>

      <Row icon={<Calendar size={16} />} label={isAr ? 'تاريخ البدء' : 'Start Date'}>
        {project.startDate || '—'}
      </Row>

      <Row icon={<CalendarCheck size={16} />} label={isAr ? 'الموعد النهائي' : 'Deadline'}>
        {project.deadline || '—'}
      </Row>

      <Row icon={<CalendarCheck size={16} />} label={isAr ? 'مدة العقد' : 'Contract Duration'}>
        {project.contractDurationMonths != null
          ? (isAr
            ? `${project.contractDurationMonths} شهر`
            : `${project.contractDurationMonths} month${project.contractDurationMonths === 1 ? '' : 's'}`)
          : <span className="text-gray-400">{isAr ? 'غير محدد' : 'Not set'}</span>}
      </Row>

      <Row icon={<Layers size={16} />} label={isAr ? 'عدد المراحل' : 'Phases'}>
        {project.phases?.length ?? 0}
      </Row>

      <Row icon={<Users size={16} />} label={isAr ? 'عدد أعضاء الفريق' : 'Team Members'}>
        {project.teamMembers?.length ?? 0}
      </Row>

      {project.manager?.name && (
        <Row icon={<User size={16} />} label={isAr ? 'مدير المشروع' : 'Project Manager'}>
          {project.manager.name}
        </Row>
      )}

      {project.createdBy?.name && (
        <Row icon={<User size={16} />} label={isAr ? 'أنشئ بواسطة' : 'Created By'}>
          {project.createdBy.name}
        </Row>
      )}

      <Row icon={<Link2 size={16} />} label={isAr ? 'رابط GitHub' : 'GitHub Link'}>
        {project.githubLink
          ? (
            <a
              href={ensureHttpUrl(project.githubLink)}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="text-[#709028] dark:text-[#A0CD39] hover:underline break-all"
            >
              {project.githubLink}
            </a>
          )
          : <span className="text-gray-400">{isAr ? 'غير متوفر' : 'Not set'}</span>}
      </Row>

      <Row icon={<Link2 size={16} />} label={isAr ? 'رابط Google Drive' : 'Google Drive Link'}>
        {project.driveLink
          ? (
            <a
              href={ensureHttpUrl(project.driveLink)}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="text-[#709028] dark:text-[#A0CD39] hover:underline break-all"
            >
              {project.driveLink}
            </a>
          )
          : <span className="text-gray-400">{isAr ? 'غير متوفر' : 'Not set'}</span>}
      </Row>
    </div>
  );
}
