import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { pmProjectTeamApi } from '../api/project.api';
import { employeeApi } from '@/modules/hr/employees/api/employee.api';
import { getAvatarColor } from '@/shared/utils';
import type { PmProjectTeamListMember } from '../types/project.types';
import type { ProjectMemberCardData } from '@/shared/modules/team/components/ProjectMemberCard';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

function toCardData(m: PmProjectTeamListMember): ProjectMemberCardData {
  return {
    id:        m.id,
    initial:   m.avatarInitial,
    color:     getAvatarColor(m.id),
    name:      m.name,
    role:      m.projectRole || m.jobTitle,
    email:     m.email,
    isActive:  m.status === 'active',
    taskCount: m.projectTasksCount,
  };
}

export function useProjectTeamTab(projectId: string, isAr: boolean) {
  const [members,      setMembers]      = useState<PmProjectTeamListMember[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PmProjectTeamListMember | null>(null);
  const [viewTarget,   setViewTarget]   = useState<PmProjectTeamListMember | null>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [available,    setAvailable]    = useState<ComboboxItem[]>([]);
  const [selectedId,   setSelectedId]   = useState('');
  const [projectRole,  setProjectRole]  = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName,      setInviteName]      = useState('');
  const [inviteEmail,     setInviteEmail]     = useState('');
  const [inviteDeptId,    setInviteDeptId]    = useState('');
  const [inviteJobTitleId, setInviteJobTitleId] = useState('');
  const [inviteRole,      setInviteRole]      = useState('');
  const [departments,     setDepartments]     = useState<ComboboxItem[]>([]);
  const [jobTitles,       setJobTitles]       = useState<ComboboxItem[]>([]);
  const [isInviting,      setIsInviting]      = useState(false);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await pmProjectTeamApi.list(projectId, { per_page: 100 });
      setMembers(res.data.data.data);
    } catch {
      /* keep previous state */
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  /* ── Fetch available members when the add modal opens ──────────────── */
  useEffect(() => {
    if (!showModal) return;
    pmProjectTeamApi.available(projectId)
      .then(res => setAvailable(res.data.data.data.map(m => ({ id: m.id, label: m.name, detail: m.jobTitle }))))
      .catch(() => setAvailable([]));
  }, [showModal, projectId]);

  /* ── Fetch departments when the invite modal opens ──────────────────── */
  useEffect(() => {
    if (!showInviteModal) return;
    employeeApi.lookupDepartments()
      .then(res => setDepartments(res.data.data.map(d => ({ id: String(d.id), label: d.name }))))
      .catch(() => setDepartments([]));
  }, [showInviteModal]);

  /* ── Fetch job titles when the invite department changes ────────────── */
  useEffect(() => {
    if (!inviteDeptId) return;
    employeeApi.lookupJobTitles(inviteDeptId)
      .then(res => setJobTitles(res.data.data.map(j => ({ id: String(j.id), label: j.name }))))
      .catch(() => setJobTitles([]));
  }, [inviteDeptId]);

  function handleSetInviteDeptId(id: string) {
    setInviteDeptId(id);
    setInviteJobTitleId('');
    if (!id) setJobTitles([]);
  }

  async function handleAddExisting() {
    if (!selectedId || !projectRole.trim()) return;
    try {
      await pmProjectTeamApi.addMember(projectId, {
        employee_id:  selectedId,
        project_role: projectRole.trim(),
      });
      toast.success(isAr ? 'تمت إضافة العضو للمشروع' : 'Member added to project');
      handleCloseModal();
      fetchTeam();
    } catch {
      toast.error(isAr ? 'فشل إضافة العضو' : 'Failed to add member');
    }
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    try {
      await pmProjectTeamApi.remove(projectId, deleteTarget.id);
      toast.success(isAr ? `تم حذف ${deleteTarget.name} من المشروع` : `${deleteTarget.name} removed`);
      setDeleteTarget(null);
      fetchTeam();
    } catch {
      toast.error(isAr ? 'فشل حذف العضو' : 'Failed to remove member');
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedId('');
    setProjectRole('');
  }

  function handleCloseInviteModal() {
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteDeptId('');
    setInviteJobTitleId('');
    setInviteRole('');
  }

  async function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim() || !inviteDeptId || !inviteJobTitleId || !inviteRole.trim()) return;
    setIsInviting(true);
    try {
      await pmProjectTeamApi.invite(projectId, {
        name:          inviteName.trim(),
        email:         inviteEmail.trim(),
        department_id: Number(inviteDeptId),
        job_title_id:  Number(inviteJobTitleId),
        project_role:  inviteRole.trim(),
      });
      toast.success(isAr ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully');
      handleCloseInviteModal();
      fetchTeam();
    } catch {
      toast.error(isAr ? 'فشل إرسال الدعوة' : 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }

  return {
    members: members.map(toCardData),
    isLoading,
    showModal,
    openModal:  () => setShowModal(true),
    closeModal: handleCloseModal,
    available,
    selectedId,  setSelectedId,
    projectRole, setProjectRole,
    canAdd: !!selectedId && !!projectRole.trim(),
    handleAddExisting,
    showInviteModal,
    openInviteModal:  () => setShowInviteModal(true),
    closeInviteModal: handleCloseInviteModal,
    inviteName,       setInviteName,
    inviteEmail,      setInviteEmail,
    inviteDeptId,     setInviteDeptId: handleSetInviteDeptId,
    inviteJobTitleId, setInviteJobTitleId,
    inviteRole,       setInviteRole,
    departments,
    jobTitles,
    isInviting,
    canInvite: !!inviteName.trim() && !!inviteEmail.trim() && !!inviteDeptId && !!inviteJobTitleId && !!inviteRole.trim(),
    handleInvite,
    deleteTarget,
    requestRemove: (id: string) => {
      const m = members.find(m => m.id === id);
      if (m) setDeleteTarget(m);
    },
    confirmRemove,
    cancelDelete: () => setDeleteTarget(null),
    viewTarget,
    requestView: (id: string) => {
      const m = members.find(m => m.id === id);
      if (m) setViewTarget(m);
    },
    cancelView: () => setViewTarget(null),
  };
}
