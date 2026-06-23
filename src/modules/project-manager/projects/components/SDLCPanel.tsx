import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';

const SDLC_STAGES = [
  { num: 1, title: 'متطلبات العمل', desc: 'تجميع احتياجات أصحاب المصلحة والمتطلبات الوظيفية' },
  { num: 2, title: 'التحليل',       desc: 'دراسة الجدوى ونمذجة البيانات والبحث'              },
  { num: 3, title: 'التصميم',       desc: 'هيكلة النظام وتدفقات تجربة المستخدم والتصميم عالي الدقة' },
  { num: 4, title: 'التطوير',       desc: 'التنفيذ والبرمجة والتكامل'                         },
  { num: 5, title: 'الاختبار',      desc: 'ضمان الجودة واختبار الانحدار واختبار القبول'       },
  { num: 6, title: 'النشر',         desc: 'الإطلاق ودليل التشغيل والتسليم'                   },
];

export function SDLCPanel({ isAr }: { isAr: boolean }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <Card overflow className="lg:col-span-1">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60
                      flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-[#A0CD39] shrink-0" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'توليد قالب SDLC' : 'Generate SDLC Template'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {isAr
              ? 'إنشاء مراحل المشروع القياسية تلقائياً'
              : 'Auto-create standard project stages'}
          </p>
        </div>

        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(p => !p)}
          className={[
            'relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0',
            enabled ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600',
          ].join(' ')}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ insetInlineStart: enabled ? '1.25rem' : '0.125rem' }}
          />
        </button>
      </div>

      {/* Stages */}
      <div className={`divide-y divide-gray-50 dark:divide-gray-700/50 transition-opacity duration-200
                       ${!enabled ? 'opacity-40' : ''}`}>
        {SDLC_STAGES.map(stage => (
          <div key={stage.num} className="px-5 py-3.5 flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20
                             text-[#709028] dark:text-[#A0CD39] text-xs font-bold
                             flex items-center justify-center mt-0.5">
              {stage.num}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </Card>
  );
}
