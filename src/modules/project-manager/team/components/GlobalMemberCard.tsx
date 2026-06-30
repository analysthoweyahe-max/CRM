import { MemberCard } from '@/shared/modules/team/components/MemberCard';
import type { GlobalMember } from '../hooks/useProjectTeamPage';

interface Props {
  member:         GlobalMember;
  selected:       boolean;
  onToggle:       (name: string) => void;
  onView:         (member: GlobalMember) => void;
  onToggleActive: (name: string) => void;
  isAr:           boolean;
}

export function GlobalMemberCard({ member, selected, onToggle, onView, onToggleActive, isAr }: Props) {
  return (
    <MemberCard
      member={{
        id:           member.name,
        initial:      member.initial,
        color:        member.color,
        name:         member.name,
        role:         member.role,
        email:        member.email,
        isActive:     member.isActive,
        projectCount: member.projectCount,
      }}
      selected={selected}
      onToggle={onToggle}
      onView={() => onView(member)}
      onToggleActive={onToggleActive}
      isAr={isAr}
    />
  );
}
