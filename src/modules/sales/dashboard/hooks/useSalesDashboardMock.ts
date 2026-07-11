import {
  Users, UserCheck, Banknote, Percent,
  TrendingUp, CheckCircle2, XCircle, Clock,
  Phone, CalendarClock, MessageCircle, Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SalesStatItem {
  key:       string;
  labelAr:   string;
  labelEn:   string;
  value:     string;
  deltaPct:  number;
  direction: 'up' | 'down';
  tone:      'good' | 'bad';
  icon:      LucideIcon;
  iconBg:    string;
  iconColor: string;
}

export interface SalesFunnelStage {
  key:     string;
  labelAr: string;
  labelEn: string;
  count:   number;
  color:   string;
}

export interface SalesLeadSource {
  key:     string;
  labelAr: string;
  labelEn: string;
  count:   number;
  color:   string;
}

export interface SalesEmployeeRow {
  id:         string;
  name:       string;
  won:        number;
  lost:       number;
  revenue:    string;
  ratePct:    number;
  targetPct:  number;
  commission: string;
}

export interface SalesFollowUp {
  id:       string;
  name:     string;
  channel:  'call' | 'meeting' | 'whatsapp' | 'email';
  icon:     LucideIcon;
  whenAr:   string;
  whenEn:   string;
  priority: 'urgent' | 'high' | 'medium';
}

export interface SalesActivityItem {
  id:     string;
  textAr: string;
  textEn: string;
  agoAr:  string;
  agoEn:  string;
}

/**
 * Temporary mock data source for the new Sales dashboard, shaped to match
 * what a future `/sales/dashboard` API response will look like so swapping
 * this hook body for a react-query call later doesn't touch any consumers.
 */
export function useSalesDashboardMock() {
  const stats: SalesStatItem[] = [
    { key: 'leads',     labelAr: 'إجمالي العملاء المحتملين', labelEn: 'Total Leads',       value: '850',       deltaPct: 12, direction: 'up',   tone: 'good', icon: Users,       iconBg: 'bg-brand-50 dark:bg-brand-900/20',   iconColor: 'text-brand-600 dark:text-brand-400' },
    { key: 'customers', labelAr: 'العملاء الفعليون',         labelEn: 'Active Customers',   value: '120',       deltaPct: 8,  direction: 'up',   tone: 'good', icon: UserCheck,   iconBg: 'bg-blue-50 dark:bg-blue-900/20',     iconColor: 'text-blue-600 dark:text-blue-400' },
    { key: 'revenue',   labelAr: 'الإيرادات الشهرية',        labelEn: 'Monthly Revenue',    value: '680ك ر.س',  deltaPct: 15, direction: 'up',   tone: 'good', icon: Banknote,    iconBg: 'bg-brand-50 dark:bg-brand-900/20',   iconColor: 'text-brand-600 dark:text-brand-400' },
    { key: 'conv-rate', labelAr: 'معدل التحويل',             labelEn: 'Conversion Rate',    value: '14%',       deltaPct: 2,  direction: 'up',   tone: 'good', icon: Percent,     iconBg: 'bg-red-50 dark:bg-red-900/20',       iconColor: 'text-red-500 dark:text-red-400' },
    { key: 'sales',     labelAr: 'إجمالي المبيعات',          labelEn: 'Total Sales',        value: '4.2م ر.س',  deltaPct: 18, direction: 'up',   tone: 'good', icon: TrendingUp,  iconBg: 'bg-brand-50 dark:bg-brand-900/20',   iconColor: 'text-brand-600 dark:text-brand-400' },
    { key: 'won',       labelAr: 'الصفقات المكتسبة',         labelEn: 'Deals Won',          value: '120',       deltaPct: 10, direction: 'up',   tone: 'good', icon: CheckCircle2, iconBg: 'bg-blue-50 dark:bg-blue-900/20',    iconColor: 'text-blue-600 dark:text-blue-400' },
    { key: 'lost',      labelAr: 'الصفقات الخاسرة',          labelEn: 'Deals Lost',         value: '87',        deltaPct: 5,  direction: 'down', tone: 'bad',  icon: XCircle,     iconBg: 'bg-red-50 dark:bg-red-900/20',       iconColor: 'text-red-500 dark:text-red-400' },
    { key: 'pending',   labelAr: 'المتابعات المعلقة',        labelEn: 'Pending Follow-ups', value: '34',        deltaPct: 3,  direction: 'down', tone: 'bad',  icon: Clock,       iconBg: 'bg-amber-50 dark:bg-amber-900/20',   iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const revenueTrend = {
    labelsAr: ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    labelsEn: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [750, 680, 520, 380, 430, 680],
  };

  const leadSources: SalesLeadSource[] = [
    { key: 'website',  labelAr: 'الموقع الإلكتروني', labelEn: 'Website',        count: 280, color: '#A0CD39' },
    { key: 'referral', labelAr: 'إحالة',              labelEn: 'Referral',       count: 195, color: '#3B82F6' },
    { key: 'social',   labelAr: 'وسائل التواصل',      labelEn: 'Social Media',   count: 170, color: '#F59E0B' },
    { key: 'cold-call',labelAr: 'اتصال بارد',         labelEn: 'Cold Call',      count: 120, color: '#8B5CF6' },
    { key: 'email',    labelAr: 'البريد الإلكتروني',  labelEn: 'Email',          count: 85,  color: '#EC4899' },
  ];

  const funnelStages: SalesFunnelStage[] = [
    { key: 'new',        labelAr: 'جديد',            labelEn: 'New',         count: 145, color: '#9CA3AF' },
    { key: 'contacted',  labelAr: 'تم التواصل',      labelEn: 'Contacted',   count: 112, color: '#3B82F6' },
    { key: 'qualified',  labelAr: 'مؤهل',            labelEn: 'Qualified',   count: 89,  color: '#A0CD39' },
    { key: 'proposal',   labelAr: 'تم إرسال العرض',  labelEn: 'Proposal Sent', count: 67, color: '#F59E0B' },
    { key: 'negotiation',labelAr: 'تفاوض',           labelEn: 'Negotiation', count: 43,  color: '#FB923C' },
    { key: 'won',        labelAr: 'مكتسب',           labelEn: 'Won',         count: 120, color: '#22C55E' },
    { key: 'lost',       labelAr: 'خسارة',           labelEn: 'Lost',        count: 87,  color: '#EF4444' },
  ];

  const employeePerformance: SalesEmployeeRow[] = [
    { id: '1', name: 'أحمد حسن',   won: 28, lost: 8,  revenue: '1.2م ر.س', ratePct: 78, targetPct: 88, commission: '25ك ر.س' },
    { id: '2', name: 'سارة محمد',  won: 24, lost: 12, revenue: '980ك ر.س', ratePct: 67, targetPct: 72, commission: '20ك ر.س' },
    { id: '3', name: 'خالد علي',   won: 22, lost: 7,  revenue: '870ك ر.س', ratePct: 76, targetPct: 81, commission: '17ك ر.س' },
    { id: '4', name: 'نور إبراهيم',won: 19, lost: 11, revenue: '720ك ر.س', ratePct: 63, targetPct: 69, commission: '14ك ر.س' },
    { id: '5', name: 'عمر يوسف',   won: 16, lost: 9,  revenue: '590ك ر.س', ratePct: 64, targetPct: 73, commission: '12ك ر.س' },
  ];

  const upcomingFollowUps: SalesFollowUp[] = [
    { id: '1', name: 'محمد الراشدي',  channel: 'call',     icon: Phone,        whenAr: 'اتصال · اليوم 2:00 م',     whenEn: 'Call · Today 2:00 PM',    priority: 'high' },
    { id: '2', name: 'فاطمة الزهراوي',channel: 'meeting',  icon: CalendarClock, whenAr: 'اجتماع · اليوم 4:30 م',   whenEn: 'Meeting · Today 4:30 PM', priority: 'urgent' },
    { id: '3', name: 'ريم الصباح',    channel: 'whatsapp', icon: MessageCircle, whenAr: 'واتساب · غداً 10:00 ص',    whenEn: 'WhatsApp · Tomorrow 10:00 AM', priority: 'high' },
    { id: '4', name: 'ناصر الدوسري',  channel: 'email',    icon: Mail,         whenAr: 'بريد إلكتروني · غداً 11:00 ص', whenEn: 'Email · Tomorrow 11:00 AM', priority: 'medium' },
  ];

  const recentActivity: SalesActivityItem[] = [
    { id: '1', textAr: 'تم تعيين عميل محتمل جديد: محمد الراشدي',                 textEn: 'New lead assigned: Mohammed Al-Rashidi',        agoAr: 'منذ 5 دقائق',   agoEn: '5 minutes ago' },
    { id: '2', textAr: 'تم تسجيل مكالمة مع فاطمة الزهراوي — مهتمة',              textEn: 'Logged call with Fatima Al-Zahrawi — interested', agoAr: 'منذ 23 دقيقة',  agoEn: '23 minutes ago' },
    { id: '3', textAr: 'تم إرسال عرض الأسعار Q-2024-089 لريم الصباح',            textEn: 'Sent quote Q-2024-089 to Reem Al-Sabbah',       agoAr: 'منذ ساعة',      agoEn: '1 hour ago' },
    { id: '4', textAr: 'صفقة مكتسبة: هند المطيري — 22,000 ر.س',                  textEn: 'Deal won: Hind Al-Mutairi — 22,000 SAR',        agoAr: 'منذ ساعتين',    agoEn: '2 hours ago' },
    { id: '5', textAr: 'تم تعيين مهمة متابعة ناصر الدوسري',                       textEn: 'Follow-up task assigned: Nasser Al-Dosari',     agoAr: 'منذ 3 ساعات',   agoEn: '3 hours ago' },
  ];

  return {
    isLoading: false,
    stats,
    revenueTrend,
    leadSources,
    funnelStages,
    employeePerformance,
    upcomingFollowUps,
    recentActivity,
  };
}
