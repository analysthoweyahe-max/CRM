import type { ReactElement } from 'react';
import { Card } from '@/shared/components/ui/Card';

export interface StageItem {
  num:   number;
  title: string;
  desc:  string;
}

interface Props {
  title:     string;
  subtitle:  string;
  icon:      ReactElement;
  stages:    StageItem[];
  enabled?:  boolean;
  onToggle?: () => void;
}

export function StagesPanel({ title, subtitle, icon, stages, enabled = true, onToggle }: Props) {
  return (
    <Card overflow className="lg:col-span-1">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60
                      flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{subtitle}</p>
        </div>

        {onToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
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
        )}
      </div>

      {/* Stages */}
      <div className={`divide-y divide-gray-50 dark:divide-gray-700/50 transition-opacity duration-200
                       ${!enabled ? 'opacity-40' : ''}`}>
        {stages.map(stage => (
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
