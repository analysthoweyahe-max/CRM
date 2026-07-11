import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  LineElement, PointElement, Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  LineElement, PointElement, Filler,
);

export const C_GREEN      = '#A0CD39';
export const C_DARK_GREEN = '#709028';
