import { useEffect, useRef } from 'react';

/** Grows a controlled textarea with its content, WhatsApp-style, up to `maxHeight` (px) then scrolls. */
export function useAutoResizeTextarea(value: string, maxHeight = 112) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  return ref;
}
