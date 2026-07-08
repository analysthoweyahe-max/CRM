import { useState, useEffect, useCallback } from 'react';
import { toast }                             from 'sonner';
import { seoTeamApi }                        from '../../team/api/seoTeam.api';
import { employeeApi }                       from '@/modules/hr/employees/api/employee.api';
import type { SeoProjectMember, SeoAvailableMember } from '../../team/types/seoTeam.types';
import type { ProjectMemberCardData }        from '@/shared/modules/team/components/ProjectMemberCard';
import type { ComboboxItem }                 from '@/shared/components/form/Combobox';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500',   'bg-violet-500', 'bg-amber-500',
  'bg-rose-500',    'bg-teal-500',  'bg-indigo-500', 'bg-orange-500',
];

function avatarColor(name: string) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Extract a list whether the API returns a plain array or a { data: [...] } wrapper. */
function extractList<T>(res: unknown): T[] {
  const payload = (res as { data?: unknown })?.data;
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown })?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
}

export function useSeoProjectTeam(projectId: string, isAr: boolean) {
  const [members,      setMembers]      = useState<SeoProjectMember[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SeoProjectMember | null>(null);
  const [viewTarget,   setViewTarget]   = useState<SeoProjectMember | null>(null);
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

  /* ── Fetch project team ────────────────────────────────────────────── */
  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await seoTeamApi.getProjectTeam(projectId);
      setMembers(extractList<SeoProjectMember>(res.data));
    } catch {
      /* keep previous state */
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  /* ── Fetch available members when modal opens ──────────────────────── */
  useEffect(() => {
    if (!showModal) return;
    seoTeamApi.getAvailableForProject(projectId)
      .then(res => {
        const list = extractList<SeoAvailableMember>(res.data);
        setAvailable(list.map(m => ({ id: m.id, label: m.name })));
      })
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

  /* ── Map to shared card data ───────────────────────────────────────── */
  function toCardData(m: SeoProjectMember): ProjectMemberCardData {
    return {
      id:        m.id,
      initial:   m.avatarInitial || m.name.charAt(0),
      color:     avatarColor(m.name),
      name:      m.name,
      role:      m.projectRole ?? m.role,
      email:     m.email,
      isActive:  m.isActive,
      taskCount: m.projectTasksCount,
    };
  }

  /* ── Add existing member ───────────────────────────────────────────── */
  async function handleAddExisting() {
    if (!selectedId || !projectRole.trim()) return;
    try {
      await seoTeamApi.addMemberToProject(projectId, {
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

  /* ── Remove member ─────────────────────────────────────────────────── */
  async function confirmRemove() {
    if (!deleteTarget) return;
    try {
      await seoTeamApi.removeFromProject(projectId, deleteTarget.id);
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

  /* ── Invite new member ─────────────────────────────────────────────── */
  async function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim() || !inviteDeptId || !inviteJobTitleId || !inviteRole.trim()) return;
    setIsInviting(true);
    try {
      await seoTeamApi.inviteToProject(projectId, {
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
