import type { ProjectOptionalFieldErrors } from '@/shared/utils/projectOptionalFields.utils';
import { CONTRACT_DURATION_OPTIONS } from '@/shared/utils/projectOptionalFields.utils';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

const INPUT_ERROR = 'border-red-400 dark:border-red-500 focus:ring-red-400';
const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export interface ProjectOptionalFieldsProps {
  githubLink:              string;
  driveLink:               string;
  contractDurationMonths:  string;
  errors?:                 ProjectOptionalFieldErrors;
  isAr:                    boolean;
  showGithubLink?:         boolean;
  onGithubLinkChange:      (v: string) => void;
  onDriveLinkChange:       (v: string) => void;
  onContractMonthsChange:  (v: string) => void;
}

export function ProjectOptionalFields({
  githubLink, driveLink, contractDurationMonths, errors, isAr,
  showGithubLink = true,
  onGithubLinkChange, onDriveLinkChange, onContractMonthsChange,
}: ProjectOptionalFieldsProps) {
  return (
    <>
      <div className={`grid grid-cols-1 ${showGithubLink ? 'sm:grid-cols-2' : ''} gap-4`}>
        {showGithubLink && (
          <div>
            <label className={LABEL}>{isAr ? 'رابط GitHub' : 'GitHub Link'}</label>
            <input
              type="url"
              value={githubLink}
              onChange={e => onGithubLinkChange(e.target.value)}
              placeholder="https://github.com/org/repo"
              dir={isAr ? 'rtl' : 'ltr'}
              className={`${INPUT}${errors?.githubLink ? ` ${INPUT_ERROR}` : ''}`}
            />
            {errors?.githubLink && (
              <p className="mt-1 text-xs text-red-500">{errors.githubLink}</p>
            )}
          </div>
        )}
        <div>
          <label className={LABEL}>{isAr ? 'رابط Google Drive' : 'Google Drive Link'}</label>
          <input
            type="url"
            value={driveLink}
            onChange={e => onDriveLinkChange(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            dir={isAr ? 'rtl' : 'ltr'}
            className={`${INPUT}${errors?.driveLink ? ` ${INPUT_ERROR}` : ''}`}
          />
          {errors?.driveLink && (
            <p className="mt-1 text-xs text-red-500">{errors.driveLink}</p>
          )}
        </div>
      </div>

      <div>
        <label className={LABEL}>{isAr ? 'مدة العقد (بالأشهر)' : 'Contract Duration (months)'}</label>
        <select
          value={contractDurationMonths}
          onChange={e => onContractMonthsChange(e.target.value)}
          dir={isAr ? 'rtl' : 'ltr'}
          className={`${INPUT}${errors?.contractDurationMonths ? ` ${INPUT_ERROR}` : ''}`}
        >
          <option value="">{isAr ? '-- بدون --' : '-- None --'}</option>
          {CONTRACT_DURATION_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {isAr ? `${m} شهر` : `${m} months`}
            </option>
          ))}
        </select>
        {errors?.contractDurationMonths && (
          <p className="mt-1 text-xs text-red-500">{errors.contractDurationMonths}</p>
        )}
      </div>
    </>
  );
}
