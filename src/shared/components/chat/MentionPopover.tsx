import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare } from 'lucide-react';
import type { MentionRef, ResolvedMention } from './mention.types';

interface Props {
  refData:    MentionRef;
  label:      string;
  info?:      ResolvedMention;
  className?: string;
  isAr:       boolean;
  onStartChat?: (ref: MentionRef) => void;
}

const CARD_WIDTH = 224; // w-56
const GAP = 6;
const VIEWPORT_PAD = 8;

interface Coord {
  top:  number;
  left: number;
}

function computeCoords(trigger: DOMRect, cardHeight: number): Coord {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = trigger.bottom + GAP;
  if (top + cardHeight > vh - VIEWPORT_PAD) {
    top = trigger.top - GAP - cardHeight;
  }
  top = Math.max(VIEWPORT_PAD, Math.min(top, vh - cardHeight - VIEWPORT_PAD));

  // Prefer aligning to the trigger start edge; clamp so the card stays on-screen.
  let left = trigger.left;
  if (left + CARD_WIDTH > vw - VIEWPORT_PAD) {
    left = trigger.right - CARD_WIDTH;
  }
  left = Math.max(VIEWPORT_PAD, Math.min(left, vw - CARD_WIDTH - VIEWPORT_PAD));

  return { top, left };
}

/** Inline @mention span — click or hover to reveal a card with avatar + start-chat action. */
export function MentionPopover({ refData, label, info, className, isAr, onStartChat }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coord>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;
    const cardHeight = cardRef.current?.offsetHeight ?? 160;
    setCoords(computeCoords(trigger, cardHeight));
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || cardRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onReposition = () => updatePosition();

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [open, updatePosition]);

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const openCard = () => {
    cancelClose();
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (trigger) setCoords(computeCoords(trigger, cardRef.current?.offsetHeight ?? 160));
    setOpen(true);
  };

  const name = info?.name ?? label.replace(/^@/, '');
  const initial = (info?.avatarInitial ?? name.charAt(0)).toUpperCase();

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={openCard}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (open) setOpen(false);
            else openCard();
          }}
          className={className ?? 'font-semibold text-brand-600 dark:text-brand-400 hover:underline'}
        >
          {label}
        </button>
      </span>

      {open && createPortal(
        <div
          ref={cardRef}
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed',
            top:      coords.top,
            left:     coords.left,
            width:    CARD_WIDTH,
            zIndex:   9999,
          }}
          className="rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 shadow-xl p-3.5 flex flex-col items-center gap-2 text-center pointer-events-auto"
        >
          {info?.avatarUrl ? (
            <img
              src={info.avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initial}
            </div>
          )}

          <div className="min-w-0 w-full">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</p>
            {info?.roleLabel && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{info.roleLabel}</p>
            )}
          </div>

          {onStartChat && (
            <button
              type="button"
              onClick={() => { onStartChat(refData); setOpen(false); }}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-colors"
            >
              <MessageSquare size={13} />
              {isAr ? 'بدء محادثة' : 'Start chat'}
            </button>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
