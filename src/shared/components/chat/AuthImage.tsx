import { useEffect, useState } from 'react';
import { TOKEN_KEY } from '@/app/config/constants';

interface Props {
  src:       string;
  alt?:      string;
  className?: string;
  onClick?:  () => void;
}

/** Fetches protected media with the Bearer token and renders via a blob URL. */
export function AuthImage({ src, alt = '', className, onClick }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    const token =
      localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? '';

    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(src);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) {
    return (
      <div className="w-40 h-28 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      onClick={onClick}
      className={className ?? 'max-w-full max-h-56 rounded-xl object-cover cursor-pointer'}
    />
  );
}
