import { useState } from 'react';

/* ── Constants ─────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  { nameAr: 'التسويق',        nameEn: 'Marketing',    count: 4, color: '#A0CD39' },
  { nameAr: 'المبيعات',       nameEn: 'Sales',         count: 5, color: '#BCDC72' },
  { nameAr: 'تقنية المعلومات', nameEn: 'IT',           count: 3, color: '#4C6320' },
  { nameAr: 'الموارد البشرية', nameEn: 'HR',           count: 3, color: '#709028' },
  { nameAr: 'العمليات',       nameEn: 'Operations',    count: 3, color: '#A8D149' },
  { nameAr: 'التصميم',        nameEn: 'Design',        count: 1, color: '#587324' },
  { nameAr: 'خدمة العملاء',   nameEn: 'Customer Svc', count: 3, color: '#D4E9A6' },
  { nameAr: 'المالية',        nameEn: 'Finance',       count: 2, color: '#C9E28A' },
];

const ATTENDANCE_BAR = [
  { dayAr: 'الأحد',    dayEn: 'Sun', present: 130, absent: 5, late: 3 },
  { dayAr: 'الإثنين',  dayEn: 'Mon', present: 142, absent: 3, late: 5 },
  { dayAr: 'الثلاثاء', dayEn: 'Tue', present: 55,  absent: 4, late: 3 },
  { dayAr: 'الأربعاء', dayEn: 'Wed', present: 140, absent: 2, late: 3 },
  { dayAr: 'الخميس',   dayEn: 'Thu', present: 128, absent: 4, late: 7 },
];

const BAR_COLORS   = ['#A0CD39', '#ef4444', '#f59e0b'] as const;
const BAR_KEYS_AR  = ['حاضر', 'غائب', 'متأخر'] as const;
const BAR_KEYS_EN  = ['Present', 'Absent', 'Late'] as const;

/* ── Donut Chart ────────────────────────────────────────────────────── */
function DonutChart() {
  const r = 62, cx = 82, cy = 82;
  const circ  = 2 * Math.PI * r;
  const total = DEPARTMENTS.reduce((s, d) => s + d.count, 0);

  const dashes  = DEPARTMENTS.map((d) => (d.count / total) * circ);
  const offsets = dashes.map((_, i) => dashes.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <svg width={164} height={164} className="shrink-0">
      {DEPARTMENTS.map((d, i) => (
        <circle
          key={d.nameEn}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={d.color}
          strokeWidth={22}
          strokeDasharray={`${dashes[i]} ${circ - dashes[i]}`}
          strokeDashoffset={-offsets[i]}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={r - 18} fill="white" className="dark:fill-gray-800" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize={19} fontWeight="bold"
            className="fill-gray-800 dark:fill-gray-100">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9}
            className="fill-gray-400">موظف</text>
    </svg>
  );
}

/* ── Bar Chart ──────────────────────────────────────────────────────── */
function BarChart({ isAr }: { isAr: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 500, H = 210;
  const PL = 44, PR = 14, PT = 20, PB = 36;
  const IW = W - PL - PR;
  const IH = H - PT - PB;
  const MAX_Y    = 160;
  const GRID_Y   = [0, 40, 80, 120, 160];
  const N        = ATTENDANCE_BAR.length;
  const groupW   = IW / N;
  const barW     = 12;
  const barGap   = 3;
  const totalBW  = 3 * barW + 2 * barGap;
  const gOffset  = (groupW - totalBW) / 2;

  function toBarY(v: number) { return PT + (1 - v / MAX_Y) * IH; }
  function barX(gi: number, bi: number) {
    return PL + gi * groupW + gOffset + bi * (barW + barGap);
  }

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>

        {/* Grid lines + Y labels */}
        {GRID_Y.map((v) => {
          const y = toBarY(v);
          return (
            <g key={v}>
              <line x1={PL} x2={W - PR} y1={y} y2={y}
                stroke="#e5e7eb" strokeWidth={0.8} strokeDasharray="5,4" />
              <text x={PL - 7} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Groups */}
        {ATTENDANCE_BAR.map((d, gi) => {
          const vals = [d.present, d.absent, d.late];
          const isHov = hovered === gi;
          return (
            <g key={gi}
               onMouseEnter={() => setHovered(gi)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'default' }}
            >
              {/* Hover background */}
              <rect
                x={PL + gi * groupW + 2} y={PT}
                width={groupW - 4} height={IH}
                rx={4}
                fill={isHov ? 'rgba(160,205,57,0.07)' : 'transparent'}
              />

              {/* Bars */}
              {vals.map((v, bi) => {
                const bh = (v / MAX_Y) * IH;
                const x  = barX(gi, bi);
                const y  = PT + IH - bh;
                return (
                  <rect
                    key={bi}
                    x={x} y={y}
                    width={barW} height={bh}
                    rx={3}
                    fill={BAR_COLORS[bi]}
                    opacity={hovered !== null && !isHov ? 0.35 : 1}
                    style={{ transition: 'opacity 0.15s' }}
                  />
                );
              })}

              {/* X-axis label */}
              <text
                x={PL + gi * groupW + groupW / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize={10}
                fill={isHov ? '#374151' : '#9ca3af'}
              >
                {isAr ? d.dayAr : d.dayEn}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (() => {
        const d    = ATTENDANCE_BAR[hovered];
        const pct  = ((PL + hovered * groupW + groupW / 2) / W) * 100;
        const clampedPct = Math.min(Math.max(pct, 14), 86);
        return (
          <div
            className="absolute pointer-events-none z-10
                       bg-white dark:bg-gray-800
                       border border-gray-100 dark:border-gray-700
                       rounded-xl shadow-lg px-3 py-2.5 min-w-27.5"
            style={{ left: `${clampedPct}%`, top: '8%', transform: 'translateX(-50%)' }}
          >
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              {isAr ? d.dayAr : d.dayEn}
            </p>
            {[
              { label: isAr ? BAR_KEYS_AR[0] : BAR_KEYS_EN[0], val: d.present, color: BAR_COLORS[0] },
              { label: isAr ? BAR_KEYS_AR[1] : BAR_KEYS_EN[1], val: d.absent,  color: BAR_COLORS[1] },
              { label: isAr ? BAR_KEYS_AR[2] : BAR_KEYS_EN[2], val: d.late,    color: BAR_COLORS[2] },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs leading-5">
                <span className="font-semibold" style={{ color }}>{label}</span>
                <span className="text-gray-400 dark:text-gray-500">: {val}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1">
        {BAR_COLORS.map((color, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {isAr ? BAR_KEYS_AR[i] : BAR_KEYS_EN[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */
export function ChartsSection({ isAr }: { isAr: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {/* Bar chart — first in HTML → RIGHT in RTL */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-5 shadow-sm"
           style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'نسبة الحضور الأسبوعية' : 'Weekly Attendance Rate'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'آخر 5 أيام عمل' : 'Last 5 working days'}
        </p>
        <BarChart isAr={isAr} />
      </div>

      {/* Donut chart — second in HTML → LEFT in RTL */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-5 shadow-sm"
           style={{ animationDelay: '0.18s' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'توزيع الأقسام' : 'Department Distribution'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'عدد الموظفين لكل قسم' : 'Employees per department'}
        </p>
        <div className="flex items-center gap-5">
          <DonutChart />
          <div className="grid grid-cols-1 gap-1.5 flex-1 min-w-0">
            {DEPARTMENTS.map((d) => (
              <div key={d.nameEn} className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {isAr ? d.nameAr : d.nameEn}
                </span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 ms-auto shrink-0">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
