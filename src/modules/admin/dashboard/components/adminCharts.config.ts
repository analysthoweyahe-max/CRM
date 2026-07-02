import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const C_GREEN  = '#A0CD39';
export const C_BLUE   = '#3B82F6';
export const C_AMBER  = '#F59E0B';
export const C_PURPLE = '#8B5CF6';
