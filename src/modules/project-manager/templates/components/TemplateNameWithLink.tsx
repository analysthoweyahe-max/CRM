import { TemplateLinkButton } from './TemplateLinkButton';

interface Props {
  name:      string;
  link?:     string | null;
  isAr?:     boolean;
  className?: string;
  nameClassName?: string;
}

export function TemplateNameWithLink({
  name,
  link,
  isAr = false,
  className = '',
  nameClassName = '',
}: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <span className={`truncate ${nameClassName}`}>{name}</span>
      <TemplateLinkButton link={link} isAr={isAr} className="w-6 h-6" />
    </span>
  );
}
