export const STATUS_CHIPS = [
  { key: 'present', ar: 'حاضر',  en: 'Present', badge: '✓', cls: 'text-green-700 bg-green-50  border-green-200 dark:bg-green-900/20 dark:border-green-700/40 dark:text-green-400' },
  { key: 'late',    ar: 'متأخر', en: 'Late',    badge: '⚠', cls: 'text-amber-700 bg-amber-50  border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-400' },
  { key: 'absent',  ar: 'غائب',  en: 'Absent',  badge: '✗', cls: 'text-red-700   bg-red-50    border-red-200   dark:bg-red-900/20   dark:border-red-700/40   dark:text-red-400'   },
  { key: 'leave',   ar: 'إجازة', en: 'Leave',   badge: 'L', cls: 'text-teal-700  bg-teal-50   border-teal-200  dark:bg-teal-900/20  dark:border-teal-700/40  dark:text-teal-400'  },
  { key: 'holiday', ar: 'عطلة',  en: 'Holiday', badge: 'H', cls: 'text-gray-600  bg-gray-50   border-gray-200  dark:bg-gray-700/40  dark:border-gray-600     dark:text-gray-400'  },
] as const;

export function getMonthOptions(isAr: boolean) {
  const AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const now  = new Date();
  const year = now.getFullYear();
  const opts = [];

  for (let y = year; y >= year - 1; y--) {
    for (let m = 11; m >= 0; m--) {
      if (y === year && m > now.getMonth()) continue;
      opts.push({
        id:    `${y}-${String(m + 1).padStart(2, '0')}`,
        label: isAr ? `${AR[m]} ${y}` : `${EN[m]} ${y}`,
      });
    }
  }
  return opts;
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
