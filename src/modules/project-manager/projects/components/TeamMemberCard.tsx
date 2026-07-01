import { ProjectMemberCard } from '@/shared/modules/team/components/ProjectMemberCard';
import type { ProjectMemberCardData } from '@/shared/modules/team/components/ProjectMemberCard';
import type { TeamMemberWithCount } from '../hooks/useProjectTeamTab';

interface Props {
  member:   TeamMemberWithCount;
  onRemove: (name: string) => void;
  onView:   (member: TeamMemberWithCount) => void;
  isAr:     boolean;
}

export function TeamMemberCard({ member, onRemove, onView, isAr }: Props) {
  const data: ProjectMemberCardData = {
    id:        member.name,
    initial:   member.initial,
    color:     member.color,
    name:      member.name,
    role:      member.role,
    email:     member.email,
    isActive:  member.isActive !== false,
    taskCount: member.taskCount,
  };

  return (
    <ProjectMemberCard
      member={data}
      onRemove={() => onRemove(member.name)}
      onView={() => onView(member)}
      isAr={isAr}
    />
  );
}
