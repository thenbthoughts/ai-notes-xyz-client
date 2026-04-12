const imageExt = /\.(gif|jpe?g|png|webp|bmp|svg|avif|heic|heif)$/i;

/** MIME or extension check (files from the system picker). */
export function fileLooksLikeImage(f: File): boolean {
  if (f.type.startsWith('image/')) return true;
  return imageExt.test(f.name);
}
