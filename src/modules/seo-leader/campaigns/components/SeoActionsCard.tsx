import { useState }         from 'react';
import { Archive, Download } from 'lucide-react';
import { useNavigate }       from 'react-router-dom';
import { useQueryClient }    from '@tanstack/react-query';
import { toast }             from 'sonner';
import { Button }            from '@/shared/components/ui/Button';
import { Modal }             from '@/shared/components/ui/Modal';
import { ROUTES }            from '@/app/router/routes';
import { extractApiError }   from '@/shared/utils/error.utils';
import { archiveSeoProject } from '../store/seoArchivedStore';
import { campaignApi }       from '../api/campaign.api';
import { stripHtml }         from '@/shared/utils/richText.utils';

export interface SeoExportData {
  name:             string;
  targetDomain?:    string | null;
  status?:          string;
  statusLabel?:     string;
  campaignTypeLabel?: string;
  startDate?:       string;
  expectedEndDate?: string | null;
  description?:     string;
}

interface Props {
  campaignId:   number | string;
  campaignName: string;
  isDraft?:     boolean;
  exportData?:  SeoExportData;
  isAr:         boolean;
  onPublished?: () => void;
}

function buildExcel(data: SeoExportData, isAr: boolean): string {
  const cell = (v: string | number | null | undefined) => {
    const safe = String(v ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<Cell><Data ss:Type="String">${safe}</Data></Cell>`;
  };

  const rows = isAr
    ? [
        ['اسم المشروع',      data.name],
        ['الدومين المستهدف', data.targetDomain ?? '—'],
        ['الحالة',           data.statusLabel  ?? data.status ?? '—'],
        ['النوع',            data.campaignTypeLabel ?? '—'],
        ['تاريخ البدء',      data.startDate    ?? '—'],
        ['تاريخ الانتهاء',   data.expectedEndDate ?? '—'],
        ['الوصف',            stripHtml(data.description) || '—'],
      ]
    : [
        ['Project Name',    data.name],
        ['Target Domain',   data.targetDomain ?? '—'],
        ['Status',          data.statusLabel  ?? data.status ?? '—'],
        ['Type',            data.campaignTypeLabel ?? '—'],
        ['Start Date',      data.startDate    ?? '—'],
        ['End Date',        data.expectedEndDate ?? '—'],
        ['Description',     stripHtml(data.description) || '—'],
      ];

  const header = isAr ? ['الحقل', 'القيمة'] : ['Field', 'Value'];
  const sheet  = isAr ? 'معلومات المشروع' : 'Project Info';

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    `  <Worksheet ss:Name="${sheet}">`,
    `    <Table>`,
    `      <Row>${header.map(h => cell(h)).join('')}</Row>`,
    ...rows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
    `    </Table>`,
    `  </Worksheet>`,
    `</Workbook>`,
  ].join('\n');
}

export function SeoActionsCard({
  campaignId, campaignName, isDraft = false, exportData, isAr, onPublished,
}: Props) {
  const navigate                      = useNavigate();
  const queryClient                   = useQueryClient();
  const [openArchive, setOpenArchive] = useState(false);
  const [publishing, setPublishing]   = useState(false);

  function handleExport() {
    const data   = exportData ?? { name: campaignName };
    const xml    = buildExcel(data, isAr);
    const blob   = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url    = URL.createObjectURL(blob);
    const a      = Object.assign(document.createElement('a'), {
      href: url, download: `campaign-${String(campaignId)}.xls`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePublish() {
    if (!isDraft || publishing) return;
    setPublishing(true);
    try {
      await campaignApi.updateSettings(campaignId, {
        name:    campaignName,
        isDraft: false,
      });
      toast.success(isAr ? 'تم نشر المشروع' : 'Project published');
      queryClient.invalidateQueries({ queryKey: ['campaign-detail', String(campaignId)] });
      queryClient.invalidateQueries({ queryKey: ['seo-project-settings', String(campaignId)] });
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      onPublished?.();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر نشر المشروع' : 'Failed to publish project'));
    } finally {
      setPublishing(false);
    }
  }

  function handleArchive() {
    archiveSeoProject(Number(campaignId));
    toast.success(
      isAr
        ? `تم أرشفة "${campaignName}" بنجاح`
        : `"${campaignName}" has been archived`
    );
    setOpenArchive(false);
    navigate(ROUTES.SEO_LEADER.DASHBOARD);
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
          {isAr ? 'إجراءات' : 'Actions'}
        </h2>

        <div className="flex flex-wrap gap-3 justify-end">
          {isDraft && (
            <Button variant="primary" disabled={publishing} onClick={handlePublish}>
              {publishing
                ? (isAr ? 'جاري النشر...' : 'Publishing…')
                : (isAr ? 'نشر المشروع' : 'Publish Project')}
            </Button>
          )}
          <Button variant="secondary" startIcon={<Archive size={15} />} onClick={() => setOpenArchive(true)}>
            {isAr ? 'أرشفة' : 'Archive'}
          </Button>
          <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
            {isAr ? 'تصدير البيانات' : 'Export Data'}
          </Button>
        </div>
      </div>

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
              ? <> سيتم نقل <span className="font-semibold text-gray-900 dark:text-gray-100">"{campaignName}"</span> إلى الأرشيف.</>
              : <> Project <span className="font-semibold">"{campaignName}"</span> will be moved to archive.</>
            }
          </p>
          <div className="w-full rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isAr ? 'يمكنك العثور عليها في تبويب الأرشيف' : 'You can find it in the Archive tab'}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
