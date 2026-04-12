import axiosCustom from '../../../../config/axiosCustom';

/** Memo image value may be a data URL or an uploaded `ai-notes-xyz/...` path. */
export function memoImageDisplaySrc(stored: string): string {
  if (!stored) return '';
  if (stored.startsWith('data:')) return stored;
  return axiosCustom.getUri({
    url: '/api/uploads/crud/getFile',
    params: { fileName: stored },
  });
}
