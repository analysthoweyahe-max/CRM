import { useState }      from 'react';
import { CheckCircle2 }  from 'lucide-react';
import { StagesPanel }   from '@/shared/components/ui/StagesPanel';
import type { StageItem } from '@/shared/components/ui/StagesPanel';

const SDLC_STAGES: StageItem[] = [
  { num: 1, title: 'متطلبات العمل', desc: 'تجميع احتياجات أصحاب المصلحة والمتطلبات الوظيفية' },
  { num: 2, title: 'التحليل',       desc: 'دراسة الجدوى ونمذجة البيانات والبحث'              },
  { num: 3, title: 'التصميم',       desc: 'هيكلة النظام وتدفقات تجربة المستخدم والتصميم عالي الدقة' },
  { num: 4, title: 'التطوير',       desc: 'التنفيذ والبرمجة والتكامل'                         },
  { num: 5, title: 'الاختبار',      desc: 'ضمان الجودة واختبار الانحدار واختبار القبول'       },
  { num: 6, title: 'النشر',         desc: 'الإطلاق ودليل التشغيل والتسليم'                   },
];

export function SDLCPanel({ isAr: _isAr }: { isAr: boolean }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <StagesPanel
      title={_isAr ? 'توليد قالب SDLC' : 'Generate SDLC Template'}
      subtitle={_isAr ? 'إنشاء مراحل المشروع القياسية تلقائياً' : 'Auto-create standard project stages'}
      icon={<CheckCircle2 size={17} className="text-[#A0CD39] shrink-0" />}
      stages={SDLC_STAGES}
      enabled={enabled}
      onToggle={() => setEnabled(p => !p)}
    />
  );
}
