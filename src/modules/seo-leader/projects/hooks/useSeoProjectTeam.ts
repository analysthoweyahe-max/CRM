import { useState, useEffect, useCallback } from 'react';
import { toast }                             from 'sonner';
import { seoTeamApi }                        from '../../team/api/seoTeam.api';
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

type ApiEnvelope<T> = { status: string; data: { data: T } };

export function useSeoProjectTeam(projectId: string, isAr: boolean) {
  const [members,      setMembers]      = useState<SeoProjectMember[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SeoProjectMember | null>(null);
  const [viewTarget,   setViewTarget]   = useState<SeoProjectMember | null>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [available,    setAvailable]    = useState<ComboboxItem[]>([]);
  const [selectedId,   setSelectedId]   = useState('');
  const [projectRole,  setProjectRole]  = useState('');

  /* ── Fetch project team ────────────────────────────────────────────── */
  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await seoTeamApi.getProjectTeam(projectId);
      const env = res.data as unknown as ApiEnvelope<SeoProjectMember[]>;
      setMembers(env.data?.data ?? []);
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
        const env = res.data as unknown as ApiEnvelope<SeoAvailableMember[]>;
        const list = env.data?.data ?? [];
        setAvailable(list.map(m => ({ id: m.id, label: m.name })));
      })
      .catch(() => setAvailable([]));
  }, [showModal, projectId]);

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
