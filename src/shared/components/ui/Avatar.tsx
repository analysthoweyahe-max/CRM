const SIZE: Record<string, string> = {
  xs: 'w-6  h-6  text-[10px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-9  h-9  text-sm',
  lg: 'w-11 h-11 text-base',
};

interface AvatarProps {
  initial:    string;
  color:      string;
  size?:      'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ initial, color, size = 'sm', className = '' }: AvatarProps) {
  return (
    <div
      className={`${color} ${SIZE[size]} rounded-full flex items-center justify-center
                  shrink-0 font-bold text-white ${className}`}
    >
      {initial}
    </div>
  );
}
