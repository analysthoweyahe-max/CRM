import { useState, useMemo } from 'react';
import { toast }             from 'sonner';
import { useProjects, updateProject } from '../../projects/store/projectStore';
import { getAllTasks }                 from '../../tasks/store/taskStore';
import type { TeamMember, MemberProfile } from '../../projects/types/project.types';

const PAGE_SIZE = 4;

export interface GlobalMember extends TeamMember {
  projectCount: number;
  projectNames: string[];
  taskCount:    number;
  totalHours:   number;
}

function downloadExcel(members: GlobalMember[], isAr: boolean) {
  const headers = isAr
    ? ['الاسم', 'الدور', 'البريد الإلكتروني', 'المشاريع', 'المهام', 'إجمالي الساعات', 'الحالة']
    : ['Name', 'Role', 'Email', 'Projects', 'Tasks', 'Total Hours', 'Status'];

  const rows = members.map(m => [
    m.name,
    m.role ?? '',
    m.email ?? '',
    m.projectCount,
    m.taskCount,
    m.totalHours,
    m.isActive !== false ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive'),
  ]);

  const cell = (v: string | number) =>
    `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${v}</Data></Cell>`;

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`,
    `  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    `  <Worksheet ss:Name="${isAr ? 'فريق العمل' : 'Team'}">`,
    `    <Table>`,
    `      <Row>${headers.map(h => cell(h)).join('')}</Row>`,
    ...rows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
    `    </Table>`,
    `  </Worksheet>`,
    `</Workbook>`,
  ].join('\n');

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'team-members.xls' });
  a.click();
  URL.revokeObjectURL(url);
}

export function useProjectTeamPage(isAr: boolean) {
  const projects = useProjects();
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [profileMember, setProfileMember] = useState<MemberProfile | null>(null);

  const allMembers: GlobalMember[] = useMemo(() => {
    const allTasks = getAllTasks();
    const map      = new Map<string, GlobalMember>();

    for (const project of projects) {
      const pName = isAr ? project.nameAr : project.nameEn;
      for (const member of project.team) {
        const existing = map.get(member.name);
        if (existing) {
          existing.projectCount++;
          existing.projectNames.push(pName);
        } else {
          const memberTasks = allTasks.filter(t => t.assigneeName === member.name);
          map.set(member.name, {
            ...member,
            projectCount: 1,
            projectNames: [pName],
            taskCount:    memberTasks.length,
            totalHours:   memberTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0),
          });
        }
      }
    }
    return [...map.values()];
  }, [projects, isAr]);

  const total     = allMembers.length;
  const pageCount = Math.ceil(total / PAGE_SIZE) || 1;
  const paged     = allMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isAllSelected = paged.length > 0 && paged.every(m => selected.has(m.name));

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (isAllSelected) paged.forEach(m => next.delete(m.name));
      else               paged.forEach(m => next.add(m.name));
      return next;
    });
  }

  function toggleOne(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function openProfile(member: GlobalMember) {
    setProfileMember({ ...member });
  }

  function removeMember(memberName: string) {
    projects.forEach(project => {
      if (!project.team.some(m => m.name === memberName)) return;
      updateProject(project.id, {
        team: project.team.filter(m => m.name !== memberName),
      });
    });
    toast.success(
      isAr ? `تمت إزالة ${memberName} من الفريق` : `${memberName} removed from team`
    );
  }

  function toggleActive(memberName: string) {
    const member   = allMembers.find(m => m.name === memberName);
    if (!member) return;
    const newActive = !(member.isActive !== false);

    projects.forEach(project => {
      if (!project.team.some(m => m.name === memberName)) return;
      updateProject(project.id, {
        team: project.team.map(m =>
          m.name === memberName ? { ...m, isActive: newActive } : m
        ),
      });
    });

    if (newActive) {
      toast.success(isAr ? `تم تفعيل ${memberName}` : `${memberName} activated`);
    } else {
      toast.warning(
        isAr ? `تم تعطيل ${memberName}` : `${memberName} deactivated`,
        {
          description: isAr ? 'هل تريد إزالته من الفريق نهائياً؟' : 'Do you want to remove them from the team?',
          action: {
            label: isAr ? 'إزالة من الفريق' : 'Remove',
            onClick: () => removeMember(memberName),
          },
        }
      );
    }
  }

  function exportSelected() {
    const toExport = allMembers.filter(m => selected.has(m.name));
    if (toExport.length > 0) downloadExcel(toExport, isAr);
  }

  return {
    members: paged,
    total,
    page,
    setPage,
    pageCount,
    selected,
    selectedCount: selected.size,
    isAllSelected,
    toggleAll,
    toggleOne,
    clearSelection: () => setSelected(new Set()),
    toggleActive,
    exportSelected,
    profileMember,
    openProfile,
    closeProfile: () => setProfileMember(null),
  };
}
