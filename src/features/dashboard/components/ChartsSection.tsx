/* ── Constants ─────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  { nameAr: 'التسويق',        nameEn: 'Marketing',    count: 4, color: '#84cc16' },
  { nameAr: 'تقنية المعلومات', nameEn: 'IT',           count: 3, color: '#3b82f6' },
  { nameAr: 'المبيعات',       nameEn: 'Sales',         count: 5, color: '#f59e0b' },
  { nameAr: 'الموارد البشرية', nameEn: 'HR',           count: 3, color: '#4ade80' },
  { nameAr: 'المالية',        nameEn: 'Finance',       count: 2, color: '#8b5cf6' },
  { nameAr: 'خدمة العملاء',   nameEn: 'Customer Svc', count: 3, color: '#f97316' },
  { nameAr: 'العمليات',       nameEn: 'Operations',    count: 3, color: '#6b7280' },
  { nameAr: 'التصميم',        nameEn: 'Design',        count: 1, color: '#1f2937' },
];

const ATTENDANCE_LINE = [
  { dayAr: 'السبت',    dayEn: 'Sat', value: 92 },
  { dayAr: 'الأحد',    dayEn: 'Sun', value: 90 },
  { dayAr: 'الإثنين',  dayEn: 'Mon', value: 93 },
  { dayAr: 'الثلاثاء', dayEn: 'Tue', value: 88 },
  { dayAr: 'الأربعاء', dayEn: 'Wed', value: 87 },
  { dayAr: 'الخميس',   dayEn: 'Thu', value: 92 },
];

/* ── SVG helpers ────────────────────────────────────────────────────── */
const W = 500, H = 210;
const PL = 44, PR = 14, PT = 18, PB = 36;
const IW = W - PL - PR;
const IH = H - PT - PB;
const GRID_Y = [0, 25, 50, 75, 100];

function toXY(i: number, val: number, count: number) {
  return {
    x: PL + (i / (count - 1)) * IW,
    y: PT + (1 - val / 100) * IH,
  };
}

function smoothPath(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c1x = pts[i].x + (pts[i + 1].x - pts[i].x) * 0.45;
    const c2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) * 0.45;
    d += ` C ${c1x},${pts[i].y} ${c2x},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

/* ── Donut Chart ────────────────────────────────────────────────────── */
function DonutChart() {
  const r = 62, cx = 82, cy = 82;
  const circ = 2 * Math.PI * r;
  const total = DEPARTMENTS.reduce((s, d) => s + d.count, 0);
  let offset = 0;

  return (
    <svg width={164} height={164} className="shrink-0">
      {DEPARTMENTS.map((d) => {
        const dash = (d.count / total) * circ;
        const el = (
          <circle
            key={d.nameEn}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={22}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - 18} fill="white" className="dark:fill-gray-800" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize={19} fontWeight="bold" className="fill-gray-800 dark:fill-gray-100">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} className="fill-gray-400">موظف</text>
    </svg>
  );
}

/* ── Area Line Chart ────────────────────────────────────────────────── */
function AreaChart({ isAr }: { isAr: boolean }) {
  const pts = ATTENDANCE_LINE.map((d, i) => toXY(i, d.value, ATTENDANCE_LINE.length));
  const line = smoothPath(pts);
  const bottom = PT + IH;
  const area = `${line} L ${pts[pts.length - 1].x},${bottom} L ${pts[0].x},${bottom} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#84cc16" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#84cc16" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {GRID_Y.map((v) => {
          const y = PT + (1 - v / 100) * IH;
          return (
            <g key={v}>
              <line x1={PL} x2={W - PR} y1={y} y2={y}
                stroke="#e5e7eb" strokeWidth={0.8} strokeDasharray="5,4" />
              <text x={PL - 7} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={area} fill="url(#aGrad)"
          style={{ animation: 'fadeArea 0.9s ease 0.3s both' }} />

        {/* Line */}
        <path
          d={line} fill="none"
          stroke="#84cc16" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1, strokeDashoffset: 1,
            animation: 'drawLine 1.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards',
          }}
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill="white" stroke="#84cc16" strokeWidth={2.5}
            style={{ animation: `fadeArea 0.4s ease ${0.4 + i * 0.12}s both` }} />
        ))}

        {/* Tooltip on last point */}
        <rect x={pts[pts.length - 1].x - 22} y={pts[pts.length - 1].y - 28}
          width={44} height={18} rx={5} fill="#84cc16" />
        <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 15}
          textAnchor="middle" fontSize={9.5} fill="white" fontWeight="bold">
          {ATTENDANCE_LINE[ATTENDANCE_LINE.length - 1].value}%
        </text>

        {/* X-axis labels */}
        {ATTENDANCE_LINE.map((d, i) => (
          <text key={i}
            x={PL + (i / (ATTENDANCE_LINE.length - 1)) * IW}
            y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">
            {isAr ? d.dayAr : d.dayEn}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────── */
export function ChartsSection({ isAr }: { isAr: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {/* Attendance area chart — first in HTML → RIGHT in RTL */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-5 shadow-sm"
           style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isAr ? 'نسبة الحضور الأسبوعية' : 'Weekly Attendance Rate'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
          {isAr ? 'آخر 6 أيام عمل' : 'Last 6 working days'}
        </p>
        <AreaChart isAr={isAr} />
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
