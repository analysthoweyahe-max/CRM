import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
);

export const C_GREEN      = '#A0CD39';
export const C_DARK_GREEN = '#709028';
export const C_AMBER      = '#FCD34D';
export const C_GRAY_400   = '#9CA3AF';
export const C_GRAY_200   = '#E5E7EB';
export const C_INDIGO     = '#818CF8';

export const TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  titleColor:      '#F9FAFB',
  bodyColor:       '#D1D5DB',
  padding:         10,
} as const;
