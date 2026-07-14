export type ProjectOptionalFieldErrors = {
  name?:                    string;
  targetDomain?:            string;
  githubLink?:              string;
  driveLink?:               string;
  contractDurationMonths?:  string;
};

const GITHUB_URL_RE = /^https:\/\/github\.com\/.+/i;
const DRIVE_URL_RE  = /^https:\/\/(drive|docs)\.google\.com\/.+/i;

export const CONTRACT_DURATION_OPTIONS = ['3', '6', '12', '24'] as const;

export function isValidGithubLink(url: string): boolean {
  return GITHUB_URL_RE.test(url.trim());
}

export function isValidDriveLink(url: string): boolean {
  return DRIVE_URL_RE.test(url.trim());
}

export function validateProjectOptionalFields(
  githubLink: string,
  driveLink: string,
  contractDurationMonths: string,
  isAr: boolean,
): ProjectOptionalFieldErrors {
  const errors: ProjectOptionalFieldErrors = {};
  const github = githubLink.trim();
  const drive  = driveLink.trim();
  const months = contractDurationMonths.trim();

  if (github && !isValidGithubLink(github)) {
    errors.githubLink = isAr
      ? 'يجب أن يكون رابط GitHub صالحاً (https://github.com/...)'
      : 'GitHub link must start with https://github.com/';
  }

  if (drive && !isValidDriveLink(drive)) {
    errors.driveLink = isAr
      ? 'يجب أن يكون رابط Google Drive صالحاً (drive.google.com أو docs.google.com)'
      : 'Google Drive link must be a valid drive.google.com or docs.google.com URL';
  }

  if (months) {
    const n = Number(months);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      errors.contractDurationMonths = isAr
        ? 'مدة العقد يجب أن تكون عدداً صحيحاً بين 1 و 120'
        : 'Contract duration must be a whole number between 1 and 120';
    }
  }

  return errors;
}

/** Empty strings become null so the API skips validation on optional fields. */
export function optionalLink(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

export function optionalContractDurationMonths(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isInteger(n) ? n : null;
}
