import { Sparkles }    from 'lucide-react';
import { StagesPanel } from '@/shared/components/ui/StagesPanel';
import type { StageItem } from '@/shared/components/ui/StagesPanel';

const SEO_PHASES: StageItem[] = [
  { num: 1, title: 'بحث الكلمات المفتاحية', desc: 'تحديد الكلمات المستهدفة وحجم البحث ونية المستخدم'          },
  { num: 2, title: 'تحليل المنافسين',        desc: 'دراسة المنافسين في نتائج البحث والمحتوى'                    },
  { num: 3, title: 'تقني SEO',               desc: 'الزحف والفهرسة والسرعة والـ Schema والأخطاء التقنية'        },
  { num: 4, title: 'تحسين الصفحات',          desc: 'تحسين العناوين والمبنى والوسوم ونية الصفحة'                },
  { num: 5, title: 'تخطيط المحتوى',          desc: 'كتابة وتخطيط المقالات والصفحات المستهدفة'                  },
  { num: 6, title: 'إعداد التقارير',          desc: 'متابعة الأداء وإعداد التقارير الشهرية للعميل'              },
];

export function SeoPhasesPanel({ isAr: _isAr }: { isAr: boolean }) {
  return (
    <StagesPanel
      title="قالب مراحل SEO الكامل"
      subtitle="أنشئ سير عمل لل SEO لتُعيّن القياسية تلقائياً لهذه الحملة"
      icon={<Sparkles size={17} className="text-[#A0CD39] shrink-0" />}
      stages={SEO_PHASES}
    />
  );
}
