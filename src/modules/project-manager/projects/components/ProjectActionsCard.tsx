import { useState }    from 'react';
import { Archive, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast }       from 'sonner';
import { Button }      from '@/shared/components/ui/Button';
import { Modal }       from '@/shared/components/ui/Modal';
import { ROUTES }      from '@/app/router/routes';
import { archiveProject } from '../store/projectStore';
import type { Project }   from '../types/project.types';

interface Props {
  project: Project;
  isAr:    boolean;
}

export function ProjectActionsCard({ project, isAr }: Props) {
  const navigate                      = useNavigate();
  const [openArchive, setOpenArchive] = useState(false);

  function handleExport() {
    const cell = (v: string | number) =>
      `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`;

    const STATUS_MAP: Record<string, { ar: string; en: string }> = {
      inProgress: { ar: 'قيد التنفيذ', en: 'In Progress' },
      completed:  { ar: 'مكتمل',       en: 'Completed'   },
      paused:     { ar: 'متوقف',       en: 'Paused'      },
      notStarted: { ar: 'لم يبدأ',     en: 'Not Started' },
    };

    const statusLabel = isAr
      ? (STATUS_MAP[project.status]?.ar ?? project.status)
      : (STATUS_MAP[project.status]?.en ?? project.status);

    /* ── Sheet 1: Project Info ── */
    const infoHeaders = isAr
      ? ['الحقل', 'القيمة']
      : ['Field', 'Value'];

    const infoRows = isAr
      ? [
          ['الاسم بالعربي',  project.nameAr],
          ['الاسم بالإنجليزي', project.nameEn],
          ['التصنيف',        project.categoryAr],
          ['الحالة',         statusLabel],
          ['نسبة الإنجاز',   project.progress],
          ['المهام المكتملة', project.tasksCompleted],
          ['إجمالي المهام',   project.tasksTotal],
          ['تاريخ البدء',    project.startDate ?? '—'],
          ['الوصف',          project.description ?? '—'],
        ]
      : [
          ['Name (AR)',        project.nameAr],
          ['Name (EN)',        project.nameEn],
          ['Category',        project.categoryEn],
          ['Status',          statusLabel],
          ['Progress (%)',    project.progress],
          ['Tasks Completed', project.tasksCompleted],
          ['Total Tasks',     project.tasksTotal],
          ['Start Date',      project.startDate ?? '—'],
          ['Description',     project.description ?? '—'],
        ];

    /* ── Sheet 2: Team Members ── */
    const teamHeaders = isAr
      ? ['الاسم', 'الدور', 'البريد الإلكتروني', 'الحالة']
      : ['Name', 'Role', 'Email', 'Status'];

    const teamRows = project.team.map(m => [
      m.name,
      m.role  ?? '—',
      m.email ?? '—',
      m.isActive !== false
        ? (isAr ? 'نشط' : 'Active')
        : (isAr ? 'غير نشط' : 'Inactive'),
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
      href: url, download: `project-${project.nameEn || project.id}.xls`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleArchive() {
    archiveProject(project.id);
    toast.success(
      isAr
        ? `تم أرشفة "${project.nameAr}" بنجاح`
        : `"${project.nameEn}" has been archived`
    );
    setOpenArchive(false);
    navigate(ROUTES.PROJECT_MANAGER.DASHBOARD);
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
          {isAr ? 'إجراءات' : 'Actions'}
        </h2>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            variant="secondary"
            startIcon={<Archive size={15} />}
            onClick={() => setOpenArchive(true)}
          >
            {isAr ? 'أرشفة' : 'Archive'}
          </Button>
          <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
            {isAr ? 'تصدير البيانات' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <Modal
        open={openArchive}
        onClose={() => setOpenArchive(false)}
        size="sm"
        title={isAr ? 'أرشفة المشروع' : 'Archive Project'}
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button variant="secondary" startIcon={<Archive size={14} />} onClick={handleArchive}>
              {isAr ? 'أرشفة' : 'Archive'}
            </Button>
            <Button variant="ghost" onClick={() => setOpenArchive(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-end gap-4 text-end">
          <div className="self-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Archive size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isAr
              ? <>سيتم نقل <span className="font-semibold text-gray-900 dark:text-gray-100">"{project.nameAr}"</span> إلى الأرشيف.</>
              : <>Project <span className="font-semibold">{project.nameEn}</span> will be moved to archive.</>
            }
          </p>
          <div className="w-full rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAr ? 'يمكنك العثور عليه في تبويب الأرشيف لاحقاً' : 'You can find it in the Archive tab later'}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
