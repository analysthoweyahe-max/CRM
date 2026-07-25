import type { PmProjectDetails, PmProjectListItem } from '../types/project.types';

type ProjectRaw = PmProjectListItem & {
  status_id?: number | null;
  status_label?: string | null;
  project_type?: string | null;
  project_type_label?: string | null;
  project_type_id?: number | null;
  is_draft?: boolean;
  start_date?: string | null;
  github_link?: string | null;
  drive_link?: string | null;
  contract_duration_months?: number | null;
};

/** Normalize PM project payloads so Combobox / status writes always see camelCase ids. */
export function normalizePmProject<T extends ProjectRaw>(raw: T): T {
  const statusIdRaw = raw.statusId ?? raw.status_id ?? null;
  const statusId = statusIdRaw != null && Number.isFinite(Number(statusIdRaw))
    ? Number(statusIdRaw)
    : null;

  return {
    ...raw,
    statusId,
    status:      String(raw.status ?? ''),
    statusLabel: String(raw.statusLabel ?? raw.status_label ?? raw.status ?? ''),
    projectTypeId: raw.projectTypeId ?? raw.project_type_id ?? undefined,
    projectType: String(raw.projectType ?? raw.project_type ?? ''),
    projectTypeLabel: String(raw.projectTypeLabel ?? raw.project_type_label ?? raw.projectType ?? ''),
    isDraft: raw.isDraft ?? raw.is_draft ?? false,
    startDate: String(raw.startDate ?? raw.start_date ?? ''),
    githubLink: (raw.githubLink ?? raw.github_link ?? null) as string | null,
    driveLink: (raw.driveLink ?? raw.drive_link ?? null) as string | null,
    contractDurationMonths:
      raw.contractDurationMonths ?? raw.contract_duration_months ?? null,
  };
}

export function normalizePmProjectDetails(raw: PmProjectDetails): PmProjectDetails {
  return normalizePmProject(raw as PmProjectDetails & ProjectRaw);
}
