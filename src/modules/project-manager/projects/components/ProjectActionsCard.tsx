import { Download } from 'lucide-react';
import { Button }   from '@/shared/components/ui/Button';
import type { PmProjectDetails } from '../types/project.types';

interface Props {
  project: PmProjectDetails;
  isAr:    boolean;
}

export function ProjectActionsCard({ project, isAr }: Props) {
  function handleExport() {
    const cell = (v: string | number) =>
      `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`;

    /* ── Sheet 1: Project Info ── */
    const infoHeaders = isAr ? ['الحقل', 'القيمة'] : ['Field', 'Value'];

    const infoRows = [
      [isAr ? 'الاسم'           : 'Name',        project.name],
      [isAr ? 'النوع'           : 'Type',        project.projectTypeLabel],
      [isAr ? 'الحالة'          : 'Status',      project.statusLabel],
      [isAr ? 'مسودة'           : 'Draft',       project.isDraft ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')],
      [isAr ? 'تاريخ البدء'     : 'Start Date',  project.startDate],
      [isAr ? 'الموعد النهائي'  : 'Deadline',    project.deadline],
      [isAr ? 'الوصف'           : 'Description', project.description ?? '—'],
    ];

    /* ── Sheet 2: Team Members ── */
    const teamHeaders = isAr
      ? ['الاسم', 'الدور', 'البريد الإلكتروني', 'الحالة']
      : ['Name', 'Role', 'Email', 'Status'];

    const teamRows = project.teamMembers.map(m => [
      m.name,
      m.projectRole || m.jobTitle || '—',
      m.email,
      m.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive'),
    ]);

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`,
      `  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,

      `  <Worksheet ss:Name="${isAr ? 'معلومات المشروع' : 'Project Info'}">`,
      `    <Table>`,
      `      <Row>${infoHeaders.map(h => cell(h)).join('')}</Row>`,
      ...infoRows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
      `    </Table>`,
      `  </Worksheet>`,

      `  <Worksheet ss:Name="${isAr ? 'فريق العمل' : 'Team'}">`,
      `    <Table>`,
      `      <Row>${teamHeaders.map(h => cell(h)).join('')}</Row>`,
      ...teamRows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
      `    </Table>`,
      `  </Worksheet>`,

      `</Workbook>`,
    ].join('\n');

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: `project-${project.id}.xls`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-3">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'إجراءات' : 'Actions'}
      </h2>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
          {isAr ? 'تصدير البيانات' : 'Export Data'}
        </Button>
      </div>
    </div>
  );
}
