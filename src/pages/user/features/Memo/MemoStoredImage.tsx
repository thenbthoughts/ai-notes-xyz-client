import { useEffect, useState } from 'react';
import { memoImageDisplaySrc } from './memoImageDisplay';

type MemoStoredImageProps = {
  stored: string;
  alt?: string;
  className?: string;
};

/**
 * Renders memo images: inline data URLs directly; `ai-notes-xyz/...` paths via
 * fetch + blob so auth matches upload (cookies + credentials).
 */
export default function MemoStoredImage({ stored, alt = '', className }: MemoStoredImageProps) {
  const [src, setSrc] = useState<string>(() => (stored.startsWith('data:') ? memoImageDisplaySrc(stored) : ''));

  useEffect(() => {
    if (stored.startsWith('data:')) {
      setSrc(memoImageDisplaySrc(stored));
      return;
    }
    const url = memoImageDisplaySrc(stored);
    if (!url) {
      setSrc('');
      return;
    }
    let cancelled = false;
    let blobUrl: string | null = null;
    void fetch(url, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [stored]);

  if (!src) {
    return <div className={className} role="img" aria-label={alt || 'Image'} />;
  }

  return <img src={src} alt={alt} className={className} />;
}
