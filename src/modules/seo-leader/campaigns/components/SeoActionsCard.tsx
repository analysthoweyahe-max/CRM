import { useState } from 'react';
import { Download } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/Button';
import { extractApiError } from '@/shared/utils/error.utils';
import { campaignApi } from '../api/campaign.api';
import type { SeoProjectPhase } from '../api/campaign.api';
import { stripHtml } from '@/shared/utils/richText.utils';

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
  phases?:      SeoProjectPhase[];
  isAr:         boolean;
  onPublished?: () => void;
}

function buildExcel(data: SeoExportData, phases: SeoProjectPhase[], isAr: boolean): string {
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
  const phaseSheet = isAr ? 'المراحل' : 'Phases';
  const phaseHeader = isAr
    ? ['المرحلة', 'عدد المهام', 'تاريخ التسليم']
    : ['Phase', 'Tasks', 'Delivery Date'];
  const phaseRows = phases.map(p => [
    p.name,
    p.tasksCount ?? 0,
    p.deliveryDate ?? '—',
  ]);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    `  <Worksheet ss:Name="${sheet}">`,
    `    <Table>`,
    `      <Row>${header.map(h => cell(h)).join('')}</Row>`,
    ...rows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
    `    </Table>`,
    `  </Worksheet>`,
    phases.length > 0 ? [
      `  <Worksheet ss:Name="${phaseSheet}">`,
      `    <Table>`,
      `      <Row>${phaseHeader.map(h => cell(h)).join('')}</Row>`,
      ...phaseRows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
      `    </Table>`,
      `  </Worksheet>`,
    ].join('\n') : '',
    `</Workbook>`,
  ].filter(Boolean).join('\n');
}

export function SeoActionsCard({
  campaignId, campaignName, isDraft = false, exportData, phases = [], isAr, onPublished,
}: Props) {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);

  function handleExport() {
    const data   = exportData ?? { name: campaignName };
    const xml    = buildExcel(data, phases, isAr);
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
      queryClient.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      onPublished?.();
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر نشر المشروع' : 'Failed to publish project'));
    } finally {
      setPublishing(false);
    }
  }

  return (
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
        <Button variant="secondary" startIcon={<Download size={15} />} onClick={handleExport}>
          {isAr ? 'تصدير البيانات' : 'Export Data'}
        </Button>
      </div>
    </div>
  );
}
