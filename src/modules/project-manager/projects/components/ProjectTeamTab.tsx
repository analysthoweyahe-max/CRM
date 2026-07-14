import { UserPlus, Mail }      from 'lucide-react';
import { Button }              from '@/shared/components/ui/Button';
import { Modal }               from '@/shared/components/ui/Modal';
import { usePermission }       from '@/shared/hooks/usePermission';
import { ProjectMemberCard }   from '@/shared/modules/team/components/ProjectMemberCard';
import { AddTeamMemberModal }  from './AddTeamMemberModal';
import { PmInviteMemberModal } from './PmInviteMemberModal';
import { MemberProfileModal }  from './MemberProfileModal';
import { useProjectTeamTab }   from '../hooks/useProjectTeamTab';

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function ProjectTeamTab({ projectId, isAr }: Props) {
  const canEditProject = usePermission('edit-pm-project');
  const {
    members, isLoading,
    showModal, openModal, closeModal,
    available, availableSearch, setAvailableSearch, isLoadingAvailable,
    selectedIds, toggleSelected,
    projectRole, setProjectRole,
    canAdd, handleAddExisting,
    showInviteModal, openInviteModal, closeInviteModal,
    inviteName, setInviteName,
    inviteEmail, setInviteEmail,
    inviteDeptId, setInviteDeptId,
    inviteJobTitleId, setInviteJobTitleId,
    inviteRole, setInviteRole,
    departments, jobTitles, isInviting,
    canInvite, handleInvite,
    deleteTarget, requestRemove, confirmRemove, cancelDelete,
    viewTarget, requestView, cancelView,
  } = useProjectTeamTab(projectId, isAr);

  return (
    <div className="space-y-4">

      {/* Add / Invite buttons */}
      {canEditProject && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" startIcon={<Mail size={15} />} onClick={openInviteModal}>
            {isAr ? 'دعوة عضو جديد' : 'Invite New Member'}
          </Button>
          <Button variant="primary" startIcon={<UserPlus size={15} />} onClick={openModal}>
            {isAr ? 'إضافة عضو جديد' : 'Add New Member'}
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && members.length === 0 && (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا يوجد أعضاء في هذا المشروع بعد' : 'No team members in this project yet'}
        </div>
      )}

      {/* Grid */}
      {!isLoading && members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <ProjectMemberCard
              key={member.id}
              member={member}
              onRemove={canEditProject ? requestRemove : undefined}
              onView={requestView}
              isAr={isAr}
            />
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AddTeamMemberModal
        open={showModal}
        onClose={closeModal}
        isAr={isAr}
        available={available}
        search={availableSearch}
        onSearchChange={setAvailableSearch}
        isLoadingAvailable={isLoadingAvailable}
        selectedIds={selectedIds}
        projectRole={projectRole}
        onToggle={toggleSelected}
        onSetRole={setProjectRole}
        canAdd={canAdd}
        onConfirm={handleAddExisting}
      />

      {/* Invite Member Modal */}
      <PmInviteMemberModal
        open={showInviteModal}
        onClose={closeInviteModal}
        isAr={isAr}
        name={inviteName}
        email={inviteEmail}
        departmentId={inviteDeptId}
        jobTitleId={inviteJobTitleId}
        projectRole={inviteRole}
        departments={departments}
        jobTitles={jobTitles}
        onSetName={setInviteName}
        onSetEmail={setInviteEmail}
        onSetDepartment={setInviteDeptId}
        onSetJobTitle={setInviteJobTitleId}
        onSetRole={setInviteRole}
        canInvite={canInvite}
        isSubmitting={isInviting}
        onConfirm={handleInvite}
      />

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={viewTarget}
        onClose={cancelView}
        isAr={isAr}
      />

      {/* Delete Confirm */}
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
            ? `هل أنت متأكد من حذف "${deleteTarget?.name}" من فريق المشروع؟`
            : `Are you sure you want to remove "${deleteTarget?.name}" from the project team?`}
        </p>
      </Modal>

    </div>
  );
}
