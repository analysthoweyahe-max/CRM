const COLORS = [
  'bg-blue-500',    'bg-purple-500', 'bg-emerald-500',
  'bg-amber-500',   'bg-rose-500',   'bg-cyan-500',
  'bg-indigo-500',  'bg-teal-500',   'bg-pink-500',
  'bg-orange-500',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}
