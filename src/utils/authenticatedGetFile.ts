import axiosCustom from '../config/axiosCustom';

/** Fetches a user-owned storage object via the authenticated getFile route (cookies + Bearer injection on API). */
export async function fetchAuthenticatedFileBlob(
    storedFileUrl: string,
    opts?: { inline?: boolean }
): Promise<Blob> {
    const params: Record<string, string> = { fileName: storedFileUrl };
    if (opts?.inline) {
        params.inline = '1';
    }
    const res = await axiosCustom.get<Blob>('/api/uploads/crud/getFile', {
        params,
        responseType: 'blob',
        withCredentials: true,
    });
    const ct = (res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('application/json')) {
        const text = await res.data.text();
        let msg = 'File request failed';
        try {
            const j = JSON.parse(text) as { message?: string };
            if (typeof j.message === 'string') {
                msg = j.message;
            }
        } catch {
            msg = text.slice(0, 200) || msg;
        }
        throw new Error(msg);
    }
    return res.data;
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
    const safeName = filename.replace(/["\r\n]/g, '_') || 'download';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function downloadStoredUserFile(storedFileUrl: string, filename: string): Promise<void> {
    const blob = await fetchAuthenticatedFileBlob(storedFileUrl, { inline: false });
    triggerBlobDownload(blob, filename);
}
