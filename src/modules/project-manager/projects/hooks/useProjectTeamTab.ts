import { useState }      from 'react';
import { toast }          from 'sonner';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useProjects, updateProject, getProjects } from '../store/projectStore';
import { useProjectTasks, getAllTasks }             from '../../tasks/store/taskStore';
import type { TeamMember, MemberProfile }           from '../types/project.types';

const AVAILABLE_EMPLOYEES = [
  { id: 'eman',   name: 'إيمان سالم',  initial: 'إ', color: 'bg-rose-500',   email: 'eman@howeyah.com'   },
  { id: 'yasser', name: 'ياسر حسن',   initial: 'ي', color: 'bg-sky-500',    email: 'yasser@howeyah.com' },
  { id: 'layla',  name: 'ليلى مصطفى', initial: 'ل', color: 'bg-violet-500', email: 'layla@howeyah.com'  },
  { id: 'omar',   name: 'عمر الشريف', initial: 'ع', color: 'bg-amber-500',  email: 'omar@howeyah.com'   },
  { id: 'dina',   name: 'دينا حسام',  initial: 'د', color: 'bg-teal-500',   email: 'dina@howeyah.com'   },
];

export interface TeamMemberWithCount extends TeamMember {
  taskCount: number;
}

export function useProjectTeamTab(projectId: string, isAr: boolean) {
  const projects = useProjects();
  const project  = projects.find(p => p.id === projectId);
  const tasks    = useProjectTasks(projectId);

  /* ── Add modal ──────────────────────────────── */
  const [showModal,  setShowModal]  = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [email,      setEmail]      = useState('');
  const [role,       setRole]       = useState('مطور');

  /* ── Delete confirm ─────────────────────────── */
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  /* ── Profile modal ──────────────────────────── */
  const [profileMember, setProfileMember] = useState<MemberProfile | null>(null);

  /* ── Derived data ───────────────────────────── */
  const team: TeamMemberWithCount[] = (project?.team ?? []).map(m => ({
    ...m,
    taskCount: tasks.filter(t => t.assigneeName === m.name).length,
  }));

  const existingNames  = new Set((project?.team ?? []).map(m => m.name));
  const availableItems: ComboboxItem[] = AVAILABLE_EMPLOYEES
    .filter(e => !existingNames.has(e.name))
    .map(e => ({ id: e.id, label: e.name }));

  /* ── Add member ─────────────────────────────── */
  function handleSelectMember(id: string) {
    setSelectedId(id);
    const emp = AVAILABLE_EMPLOYEES.find(e => e.id === id);
    if (emp) setEmail(emp.email);
  }

  function handleAdd() {
    const emp = AVAILABLE_EMPLOYEES.find(e => e.id === selectedId);
    if (!emp) return;
    const member: TeamMember = {
      initial:  emp.initial,
      color:    emp.color,
      name:     emp.name,
      email:    email,
      role:     role.trim() || 'عضو',
      isActive: true,
    };
    updateProject(projectId, { team: [...(project?.team ?? []), member] });
    toast.success(isAr ? `تمت إضافة ${emp.name} للمشروع` : `${emp.name} added to project`);
    handleClose();
  }

  function handleClose() {
    setShowModal(false);
    setSelectedId('');
    setEmail('');
    setRole('مطور');
  }

  /* ── Delete member ──────────────────────────── */
  function requestRemove(name: string) {
    setDeleteTarget(name);
  }

  function confirmRemove() {
    if (!deleteTarget) return;
    updateProject(projectId, {
      team: (project?.team ?? []).filter(m => m.name !== deleteTarget),
    });
    toast.success(isAr ? `تم حذف ${deleteTarget} من المشروع` : `${deleteTarget} removed from project`);
    setDeleteTarget(null);
  }

  /* ── Profile view ───────────────────────────── */
  function openProfile(member: TeamMemberWithCount) {
    const allTasks    = getAllTasks();
    const allProjects = getProjects();

    const memberTasks = allTasks.filter(t => t.assigneeName === member.name);
    const projectIds  = [...new Set(memberTasks.map(t => t.projectId))];
    const projectNames = projectIds
      .map(pid => allProjects.find(p => p.id === pid))
      .filter(Boolean)
      .map(p => (isAr ? p!.nameAr : p!.nameEn));

    const totalHours = memberTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

    setProfileMember({ ...member, projectNames, totalHours });
  }

  return {
    team,
    /* add modal */
    showModal,
    openModal:  () => setShowModal(true),
    closeModal: handleClose,
    availableItems,
    form: { selectedId, email, setEmail, role, setRole, onSelectMember: handleSelectMember },
    handleAdd,
    canAdd: !!selectedId,
    /* delete confirm */
    deleteTarget,
    requestRemove,
    confirmRemove,
    cancelDelete: () => setDeleteTarget(null),
    /* profile */
    profileMember,
    openProfile,
    closeProfile: () => setProfileMember(null),
  };
}
