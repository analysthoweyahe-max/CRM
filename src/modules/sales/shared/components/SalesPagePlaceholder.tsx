import type { ReactNode } from 'react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

interface Props {
  titleAr:    string;
  titleEn:    string;
  subtitleAr: string;
  subtitleEn: string;
  icon:       ReactNode;
}

/** Stub page for Sales-module routes that only have their shell built so far — no data wired yet. */
export function SalesPagePlaceholder({ titleAr, titleEn, subtitleAr, subtitleEn, icon }: Props) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-5">
      <PageHeader title={isAr ? titleAr : titleEn} subtitle={isAr ? subtitleAr : subtitleEn} />
      <Card padding="lg">
        <EmptyState
          icon={icon}
          title={isAr ? 'هذه الصفحة قيد الإنشاء' : 'This page is coming soon'}
          description={isAr
            ? 'الشكل العام والتنقل جاهزين، وهيتم ربط المحتوى والبيانات لاحقًا'
            : 'The shell and navigation are ready — content and data will be wired up next'}
        />
      </Card>
    </div>
  );
}
