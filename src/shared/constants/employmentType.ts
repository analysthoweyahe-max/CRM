export const EmploymentType = {
  FullTime: 'full_time',
  PartTime: 'part_time',
  Freelancer: 'freelancer',
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full-Time',
  [EmploymentType.PartTime]: 'Part-Time',
  [EmploymentType.Freelancer]: 'Freelancer',
};
