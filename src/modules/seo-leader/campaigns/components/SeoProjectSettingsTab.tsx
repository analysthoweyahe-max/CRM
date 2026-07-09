import { useNavigate }               from 'react-router-dom';
import { ROUTES }                    from '@/app/router/routes';
import { SeoProjectInfoForm }        from './SeoProjectInfoForm';
import { SeoSettingsPhasesSection }  from './SeoSettingsPhasesSection';
import { SeoActionsCard }            from './SeoActionsCard';
import type { SeoExportData }        from './SeoActionsCard';
import { DangerZoneCard }            from '@/shared/modules/project/components/DangerZoneCard';
import { campaignApi }               from '../api/campaign.api';
import { useSeoProjectSettings }     from '../hooks/useSeoProjectSettings';
import { toast }                     from 'sonner';

interface Props {
  campaignId: string;
  isAr:       boolean;
}

export function SeoProjectSettingsTab({ campaignId, isAr }: Props) {
  const navigate = useNavigate();

  const {
    isLoading, settings,
    name, setName, startDate, setStartDate,
    domain, setDomain, desc, setDesc,
    status, setStatus, type, setType,
    githubLink, setGithubLink, driveLink, setDriveLink,
    contractDurationMonths, setContractDurationMonths,
    optionalFieldErrors,
    statusOptions, typeOptions,
    isSaving, saved, handleSave, canSave,
  } = useSeoProjectSettings(campaignId, isAr);

  const exportData: SeoExportData = {
    name:              settings?.name             ?? name,
    targetDomain:      settings?.targetDomain     ?? domain,
    status:            settings?.status           ?? status,
    statusLabel:       settings?.statusLabel,
    campaignTypeLabel: settings?.campaignTypeLabel,
    startDate:         settings?.startDate        ?? startDate,
    description:       settings?.description      ?? desc,
  };

  function handleDelete() {
    campaignApi.remove(campaignId)
      .then(() => {
        toast.success(isAr ? 'تم حذف المشروع' : 'Project deleted');
        navigate(ROUTES.SEO_LEADER.DASHBOARD);
      })
      .catch((err: unknown) => {
        const httpStatus = (err as { response?: { status?: number } })?.response?.status;
        if (httpStatus === 403) {
          toast.error(isAr
            ? 'ليس لديك صلاحية لحذف هذا المشروع. هذا الإجراء متاح فقط لمدير النظام (Super Admin).'
            : "You don't have permission to delete this project. Only a Super Admin can do this.");
        } else {
          toast.error(isAr ? 'حدث خطأ أثناء حذف المشروع' : 'Failed to delete the project');
        }
      });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <SeoProjectInfoForm
        name={name}           onChangeName={setName}
        startDate={startDate} onChangeStartDate={setStartDate}
        domain={domain}       onChangeDomain={setDomain}
        desc={desc}           onChangeDesc={setDesc}
        status={status}       onChangeStatus={setStatus}
        type={type}           onChangeType={setType}
        githubLink={githubLink} onChangeGithubLink={setGithubLink}
        driveLink={driveLink}   onChangeDriveLink={setDriveLink}
        contractDurationMonths={contractDurationMonths}
        onChangeContractDurationMonths={setContractDurationMonths}
        optionalFieldErrors={optionalFieldErrors}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        onSave={handleSave}
        isSaving={isSaving}
        saved={saved}
        canSave={canSave}
        isAr={isAr}
      />

      <SeoSettingsPhasesSection isAr={isAr} />

      <SeoActionsCard
        campaignId={campaignId}
        campaignName={settings?.name ?? name}
        exportData={exportData}
        isAr={isAr}
      />

      <DangerZoneCard
        projectName={settings?.name ?? name}
        onDelete={handleDelete}
        isAr={isAr}
        deleteLabel={isAr ? 'حذف المشروع نهائياً' : 'Delete Project'}
        description={isAr
          ? 'حذف المشروع نهائياً مع جميع مهامه وبياناته.'
          : 'Permanently delete this project and all its tasks and data.'}
      />
    </div>
  );
}
