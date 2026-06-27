import { UserPlus }            from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { TeamMemberCard }      from './TeamMemberCard';
import { AddTeamMemberModal }  from './AddTeamMemberModal';
import { MemberProfileModal }  from './MemberProfileModal';
import { useProjectTeamTab }   from '../hooks/useProjectTeamTab';

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectTeamTab({ projectId, isAr }: Props) {
  const {
    team, showModal, openModal, closeModal,
    availableItems, form, handleAdd, canAdd,
    deleteTarget, requestRemove, confirmRemove, cancelDelete,
    profileMember, openProfile, closeProfile,
  } = useProjectTeamTab(projectId, isAr);

  return (
    <div className="space-y-4">

      {/* Add button */}
      <div className="flex justify-end">
        <Button variant="primary" startIcon={<UserPlus size={15} />} onClick={openModal}>
          {isAr ? 'إضافة عضو جديد' : 'Add New Member'}
        </Button>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <TeamMemberCard
            key={member.name}
            member={member}
            onRemove={requestRemove}
            onView={openProfile}
            isAr={isAr}
          />
        ))}
      </div>

      {/* Add Member Modal */}
      <AddTeamMemberModal
        open={showModal}
        onClose={closeModal}
        availableItems={availableItems}
        selectedId={form.selectedId}
        email={form.email}
        role={form.role}
        onSelectMember={form.onSelectMember}
        onSetEmail={form.setEmail}
        onSetRole={form.setRole}
        onConfirm={handleAdd}
        canAdd={canAdd}
        isAr={isAr}
      />

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={cancelDelete}
        title={isAr ? 'حذف العضو' : 'Remove Member'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={cancelDelete}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="danger" onClick={confirmRemove}>
              {isAr ? 'حذف' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 text-end leading-relaxed">
          {isAr
            ? `هل أنت متأكد من حذف "${deleteTarget}" من فريق المشروع؟`
            : `Are you sure you want to remove "${deleteTarget}" from the project team?`}
        </p>
      </Modal>

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={profileMember}
        onClose={closeProfile}
        isAr={isAr}
      />

    </div>
  );
}
