import axiosCustom from '../../../../../config/axiosCustom';
import axios, { AxiosRequestConfig } from 'axios';

export interface OpencodeTaskFileRef {
    fileName: string;
    filePath: string;
    contentType: string;
    size: number;
}

export interface OpencodeTaskListItem {
    id: string;
    sortIndex: number;
    title: string;
    instruction: string;
    status: string;
    summary: string;
    errorReason: string;
    /** OpenCode session message log for this task (filled when the task finishes). */
    agentTranscript: string;
    inputFileRefs: OpencodeTaskFileRef[];
    outputFileRefs: OpencodeTaskFileRef[];
    createdAtUtc: string;
    updatedAtUtc: string;
    runStartedAtUtc?: string | null;
    runFinishedAtUtc?: string | null;
    /** Wall time for run start → done/error, when both timestamps exist (ms). */
    executionDurationMs?: number | null;
}

export async function listOpencodeTasks({
    threadId,
    limit = 50,
}: {
    threadId: string;
    limit?: number;
}): Promise<{ tasks: OpencodeTaskListItem[]; sdkSessionId?: string }> {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/opencode-tasks/list',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId, limit },
    };
    const response = await axiosCustom.request(config);
    return response.data;
}

async function messageFromAxiosBlobError(error: unknown): Promise<string> {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
            const t = await error.response.data.text();
            const j = JSON.parse(t) as { message?: string };
            return j.message || t || error.message || 'Failed to load file';
        } catch {
            return error.message || 'Failed to load file';
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Failed to load file';
}

/**
 * Opens a stored OpenCode output file in a new tab using the same authenticated axios session
 * as the rest of the app. Plain &lt;a href&gt; to the API often fails (401) when the SPA and API
 * differ by origin/port because the session cookie is not sent on that navigation.
 */
export async function openOpencodeOutputFileInNewTab(fileRef: OpencodeTaskFileRef): Promise<void> {
    try {
        const response = await axiosCustom.get<Blob>('/api/uploads/crud/getFile', {
            params: { fileName: fileRef.filePath },
            responseType: 'blob',
        });
        const blob = response.data;
        const ct = response.headers['content-type'] || '';
        if (ct.includes('application/json')) {
            const text = await blob.text();
            let msg = 'Could not load file';
            try {
                const j = JSON.parse(text) as { message?: string };
                msg = j.message || text || msg;
            } catch {
                msg = text || msg;
            }
            throw new Error(msg);
        }
        if (blob.size < 1) {
            throw new Error('Empty file');
        }
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileRef.fileName || 'file';
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
        const msg = await messageFromAxiosBlobError(e);
        if (e instanceof Error && e.message === msg) {
            throw e;
        }
        throw new Error(msg);
    }
}

function parseUtcMs(iso: string | null | undefined): number | null {
    if (typeof iso !== 'string' || iso.length < 4) return null;
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : null;
}

/**
 * Short label for task row: completed duration, live running elapsed, or null.
 */
export function getOpencodeTaskExecutionLabel(
    task: Pick<OpencodeTaskListItem, 'status' | 'executionDurationMs' | 'runStartedAtUtc'>,
    nowMs: number
): string | null {
    const st = task.status;
    if (st === 'done' || st === 'error') {
        const d = task.executionDurationMs;
        if (typeof d === 'number' && Number.isFinite(d) && d >= 0) {
            return `Ran ${formatOpencodeDurationMs(d)}`;
        }
        return null;
    }
    if (st === 'running') {
        const start = parseUtcMs(task.runStartedAtUtc);
        if (start !== null && nowMs >= start) {
            return `Running ${formatOpencodeDurationMs(nowMs - start)}`;
        }
        return 'Running…';
    }
    return null;
}

/** Human-readable duration for OpenCode task execution (running or completed). */
export function formatOpencodeDurationMs(ms: number): string {
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) {
        return '—';
    }
    if (ms < 1000) {
        return `${Math.round(ms)} ms`;
    }
    const sec = Math.floor(ms / 1000);
    if (sec < 60) {
        return `${sec}s`;
    }
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) {
        return s > 0 ? `${m}m ${s}s` : `${m}m`;
    }
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export function formatOpencodeFileSize(bytes: number): string {
    if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
        return '—';
    }
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
    }
    const mb = kb / 1024;
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Deduplicate: unique storage path, and same display name + size (tasks often persist the same helper twice). */
export function collectUniqueOpencodeOutputFiles(
    tasks: Array<{ outputFileRefs?: OpencodeTaskFileRef[] }>
): OpencodeTaskFileRef[] {
    const seenPath = new Set<string>();
    const seenNameSize = new Set<string>();
    const out: OpencodeTaskFileRef[] = [];
    for (const t of tasks) {
        const refs = t.outputFileRefs;
        if (!Array.isArray(refs)) {
            continue;
        }
        for (const f of refs) {
            const p = typeof f?.filePath === 'string' ? f.filePath : '';
            if (p.length < 1 || seenPath.has(p)) {
                continue;
            }
            const name = typeof f?.fileName === 'string' ? f.fileName : '';
            const size = typeof f?.size === 'number' ? f.size : 0;
            const nameSizeKey = `${name}\0${size}`;
            if (seenNameSize.has(nameSizeKey)) {
                continue;
            }
            seenPath.add(p);
            seenNameSize.add(nameSizeKey);
            out.push(f);
        }
    }
    return out;
}

