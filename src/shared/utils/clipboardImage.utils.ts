import type { ClipboardEvent } from 'react';

/** Extracts a pasted image file from a clipboard paste event, if one is present. */
export function getPastedImageFile(e: ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}
