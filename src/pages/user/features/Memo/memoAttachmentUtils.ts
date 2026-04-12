const imageExt = /\.(gif|jpe?g|png|webp|bmp|svg|avif|heic|heif)$/i;

export function memoAttachmentLooksLikeImage(stored: string): boolean {
  if (!stored) return false;
  if (stored.startsWith('data:image/')) return true;
  return imageExt.test(stored);
}

export function memoAttachmentDisplayName(stored: string, idx: number): string {
  if (!stored) return `Attachment ${idx + 1}`;
  if (stored.startsWith('data:')) return `Attachment ${idx + 1}`;
  const clean = stored.split('?')[0];
  const parts = clean.split('/');
  const name = parts[parts.length - 1];
  return name || `Attachment ${idx + 1}`;
}
