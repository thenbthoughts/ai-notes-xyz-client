import type { AnswerMachineV4StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type Am4DownloadableFileRow = {
    fileDocId: string;
    label: string;
    mimeType: string;
    storedFileUrl: string;
    canShellDownload: boolean;
};

/** Deduped workspace files that can be downloaded (Shell path and/or GridFS storage). */
export function collectAm4DownloadableFilesFromMessages(messages: tsMessageItem[]): Am4DownloadableFileRow[] {
    const byId = new Map<string, Am4DownloadableFileRow>();
    for (const m of messages) {
        if (m.type !== 'answer_machine_v4_stream') {
            continue;
        }
        const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp) {
            continue;
        }
        if (sp.kind === 'file_artifact' && sp.fileDocId) {
            const rel = (sp.shellRelativePath || '').trim();
            byId.set(sp.fileDocId, {
                fileDocId: sp.fileDocId,
                label: sp.originalName || 'file',
                mimeType: sp.mimeType || 'application/octet-stream',
                storedFileUrl: (sp.storedFileUrl || '').trim(),
                canShellDownload:
                    !!rel && !rel.includes('..') && String(sp.uploadStatus || '') === 'saved_to_shell',
            });
        }
        if (sp.kind === 'iteration' && sp.attachedFiles?.length) {
            for (const f of sp.attachedFiles) {
                const fid = f.fileDocId;
                if (!fid) {
                    continue;
                }
                const rel = (f.shellRelativePath || '').trim();
                byId.set(fid, {
                    fileDocId: fid,
                    label: f.fileName || 'file',
                    mimeType: f.mimeType || 'application/octet-stream',
                    storedFileUrl: (f.storedFileUrl || '').trim(),
                    canShellDownload:
                        !!rel && !rel.includes('..') && String(f.uploadStatus || '') === 'saved_to_shell',
                });
            }
        }
    }
    return [...byId.values()];
}

export function inferAm4UploadTarget(items: tsMessageItem[]): { requestId: string; iteration: number } | null {
    let requestId: string | null = null;
    let maxIter = 0;
    for (const m of items) {
        const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp) {
            continue;
        }
        if ('requestId' in sp && typeof sp.requestId === 'string' && sp.requestId) {
            requestId = sp.requestId;
        }
        if (sp.kind === 'iteration' && typeof sp.iterationNumber === 'number') {
            maxIter = Math.max(maxIter, sp.iterationNumber);
        }
    }
    if (!requestId) {
        return null;
    }
    return { requestId, iteration: maxIter > 0 ? maxIter : 1 };
}

const LIKELY_FILE_RE = /\b[\w.-]+\.(png|jpe?g|gif|webp|pdf|txt|csv|json|md|zip)\b/gi;

/** Basenames mentioned in assistant text (for highlighting relevant downloads). */
export function extractLikelyFilenamesFromText(text: string): string[] {
    const out = new Set<string>();
    const t = text || '';
    let m: RegExpExecArray | null = LIKELY_FILE_RE.exec(t);
    while (m !== null) {
        out.add(m[0].toLowerCase());
        m = LIKELY_FILE_RE.exec(t);
    }
    return [...out];
}

export type Am4ThreadToolsContext = {
    threadId: string;
    downloadableFiles: Am4DownloadableFileRow[];
    uploadTarget: { requestId: string; iteration: number } | null;
    onUploaded?: () => void;
};
