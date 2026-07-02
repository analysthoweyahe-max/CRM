import { MemberCard }     from '@/shared/modules/team/components/MemberCard';
import { getAvatarColor } from '@/shared/utils';
import type { PmTeamMemberApi } from '../hooks/useProjectTeamPage';

interface Props {
  member:         PmTeamMemberApi;
  selected:       boolean;
  onToggle:       (id: string) => void;
  onView:         (id: string) => void;
  onToggleActive: (id: string) => void;
  isAr:           boolean;
}

export function GlobalMemberCard({ member, selected, onToggle, onView, onToggleActive, isAr }: Props) {
  return (
    <MemberCard
      member={{
        id:           member.id,
        initial:      member.avatarInitial,
        color:        getAvatarColor(member.id),
        name:         member.name,
        role:         member.jobTitle,
        email:        member.email,
        isActive:     member.isActive,
        projectCount: member.activeProjectsCount,
      }}
      selected={selected}
      onToggle={onToggle}
      onView={onView}
      onToggleActive={onToggleActive}
      isAr={isAr}
    />
  );
}
