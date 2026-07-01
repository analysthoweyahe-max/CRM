import type { SeoTask } from '../types/seoTask.types';

export interface SeoTaskCardProps {
  task:       SeoTask;
  isAr:       boolean;
  onDetails?: (id: number) => void;
}
