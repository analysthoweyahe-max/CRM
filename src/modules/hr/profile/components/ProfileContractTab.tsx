import { FileText, Download, CalendarDays, Briefcase, Hash } from 'lucide-react';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { EMPLOYEES }    from '@/modules/hr/employees/data/employeeData';
import { Button }       from '@/shared/components/ui/Button';

interface Props {
  user: AuthUser;
  isAr: boolean;
}

function generateContractPDF(
  user: AuthUser,
  emp: ReturnType<typeof EMPLOYEES.find>,
  isAr: boolean,
) {
  const name      = user.fullName;
  const empId     = emp?.id ?? user.employeeId ?? '—';
  const dept      = isAr ? (emp?.department ?? '—') : (emp?.deptEn ?? '—');
  const title     = isAr ? (emp?.jobTitle ?? '—') : (emp?.jobTitleEn ?? '—');
  const hireDate  = emp?.hireDate ?? '—';
  const email     = emp?.email ?? '—';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>عقد عمل — ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl;
           color: #302F33; padding: 48px; font-size: 14px; line-height: 1.8; }
    .logo  { font-size: 22px; font-weight: 800; color: #709028; margin-bottom: 4px; }
    .sub   { font-size: 12px; color: #888; margin-bottom: 32px; }
    .title { font-size: 20px; font-weight: 700; text-align: center;
             padding: 12px 0; border-top: 2px solid #A0CD39; border-bottom: 2px solid #A0CD39;
             margin-bottom: 28px; }
    h3     { font-size: 13px; font-weight: 700; color: #709028;
             border-bottom: 1px solid #D8EBAE; padding-bottom: 6px; margin: 24px 0 12px; }
    table  { width: 100%; border-collapse: collapse; }
    td     { padding: 7px 10px; font-size: 13px; }
    td:first-child { color: #888; width: 160px; }
    td:last-child  { font-weight: 600; }
    tr:nth-child(even) td { background: #f9fafb; }
    .clause { margin-bottom: 12px; }
    .clause span { font-weight: 700; color: #709028; }
    .sigs  { display: flex; justify-content: space-between; margin-top: 56px; }
    .sig   { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #ccc; margin-top: 48px; padding-top: 8px;
                font-size: 12px; color: #888; }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>
  <div class="logo">Howaya HR &nbsp;هواية</div>
  <div class="sub">نظام الموارد البشرية</div>

  <div class="title">عقد عمل — Employment Contract</div>

  <h3>بيانات الموظف</h3>
  <table>
    <tr><td>الاسم الكامل</td><td>${name}</td></tr>
    <tr><td>الرقم الوظيفي</td><td>${empId}</td></tr>
    <tr><td>البريد الإلكتروني</td><td>${email}</td></tr>
    <tr><td>القسم</td><td>${dept}</td></tr>
    <tr><td>المسمى الوظيفي</td><td>${title}</td></tr>
    <tr><td>تاريخ الانضمام</td><td>${hireDate}</td></tr>
    <tr><td>نوع التوظيف</td><td>دوام كامل</td></tr>
    <tr><td>ساعات العمل</td><td>09:00 – 17:00</td></tr>
  </table>

  <h3>بنود العقد</h3>
  <div class="clause"><span>1.</span> يلتزم الموظف بأداء مهامه وفقاً للوصف الوظيفي المحدد وتعليمات الإدارة.</div>
  <div class="clause"><span>2.</span> يخضع الموظف لفترة تجربة مدتها ثلاثة أشهر من تاريخ الانضمام.</div>
  <div class="clause"><span>3.</span> يتقاضى الموظف راتباً شهرياً يُصرف في نهاية كل شهر ميلادي.</div>
  <div class="clause"><span>4.</span> يحق للموظف الحصول على إجازة سنوية مدفوعة وفقاً للسياسة الداخلية.</div>
  <div class="clause"><span>5.</span> يلتزم الطرفان بإشعار مسبق لا يقل عن 30 يوماً قبل إنهاء العقد.</div>
  <div class="clause"><span>6.</span> يُعدّ هذا العقد سارياً اعتباراً من تاريخ التوقيع وحتى إشعار آخر.</div>

  <div class="sigs">
    <div class="sig">
      <div class="sig-line">توقيع الموظف<br/>${name}</div>
    </div>
    <div class="sig">
      <div class="sig-line">توقيع الإدارة<br/>Howaya HR</div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

export function ProfileContractTab({ user, isAr }: Props) {
  const emp = EMPLOYEES.find((e) => e.id === user.employeeId);

  return (
    <div className="space-y-5 pt-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isAr
          ? 'يمكنك تحميل نسخة من عقد عملك بصيغة PDF.'
          : 'You can download a copy of your employment contract as PDF.'}
      </p>

      {/* Contract card */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100
                      dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">

        {/* File icon */}
        <div className="w-12 h-12 rounded-xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10
                        flex items-center justify-center shrink-0">
          <FileText size={22} className="text-[#709028]" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {isAr ? `عقد عمل — ${user.fullName}` : `Employment Contract — ${user.fullName}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Hash size={11} /> {emp?.id ?? '—'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={11} />
              {isAr ? (emp?.jobTitle ?? '—') : (emp?.jobTitleEn ?? '—')}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> {emp?.hireDate ?? '—'}
            </span>
          </div>
        </div>

        {/* Download */}
        <Button
          variant="secondary"
          type="button"
          onClick={() => generateContractPDF(user, emp, isAr)}
          startIcon={<Download size={15} />}
          className="shrink-0"
        >
          {isAr ? 'تحميل PDF' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
}
