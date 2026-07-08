import DOMPurify from 'dompurify';

interface RichTextViewProps {
  html:      string;
  className?: string;
}

export function RichTextView({ html, className }: RichTextViewProps) {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'] });
  return (
    <div
      className={[
        'max-w-none [&_p]:m-0 [&_strong]:font-bold [&_em]:italic',
        '[&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5',
        className ?? '',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
