import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LucideTerminal, LucideRefreshCw, LucideFile } from 'lucide-react';

import {
    listOpencodeTasks,
    OpencodeTaskListItem,
    OpencodeTaskFileRef,
    collectUniqueOpencodeOutputFiles,
    openOpencodeOutputFileInNewTab,
    formatOpencodeFileSize,
    getOpencodeTaskExecutionLabel,
} from '../../utils/opencodeTasksAxios';

const POLL_MS = 8000;

function useNowInterval(active: boolean, intervalMs: number): number {
    const [n, setN] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return;
        const id = window.setInterval(() => setN(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [active, intervalMs]);
    return n;
}

export default function ComponentOpencodeTaskPanel({ threadId }: { threadId: string }) {
    const [tasks, setTasks] = useState<OpencodeTaskListItem[]>([]);
    const [sdkSessionId, setSdkSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState('');

    const threadIdRef = useRef(threadId);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        threadIdRef.current = threadId;
    }, [threadId]);

    const poll = async () => {
        if (!threadIdRef.current) return;
        try {
            setIsLoading(true);
            const res = await listOpencodeTasks({ threadId: threadIdRef.current, limit: 30 });
            setTasks(Array.isArray(res.tasks) ? res.tasks : []);
            setSdkSessionId(typeof res.sdkSessionId === 'string' ? res.sdkSessionId : '');
            setErrorText('');
        } catch (e) {
            setErrorText(e instanceof Error ? e.message : 'Failed to load OpenCode tasks');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!threadId) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        poll();
        intervalRef.current = setInterval(() => poll(), POLL_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threadId]);

    if (!threadId) return null;

    const generatedFiles = collectUniqueOpencodeOutputFiles(tasks);
    const hasRunningTask = tasks.some((t) => t.status === 'running');
    const hasDoneTaskWithSummary = tasks.some(
        (t) => t.status === 'done' || t.status === 'error'
    );
    const tickNow = useNowInterval(hasRunningTask, 1000);

    const openOutputFile = async (f: OpencodeTaskFileRef) => {
        try {
            await openOpencodeOutputFileInNewTab(f);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Could not open file');
        }
    };

    return (
        <div className="mt-3 border border-blue-200 rounded-sm bg-blue-50/30 p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                    <LucideTerminal className="w-4 h-4" />
                    <span>OpenCode Tasks</span>
                </div>
                <button
                    onClick={() => poll()}
                    className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                    <LucideRefreshCw className={isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                    Refresh
                </button>
            </div>

            {errorText && (
                <div className="mt-2 space-y-1">
                    <div className="text-xs text-red-600 whitespace-pre-wrap">{errorText}</div>
                    <button
                        type="button"
                        onClick={() => void poll()}
                        className="text-[11px] font-medium text-red-800 underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            <div className="mt-3 rounded border border-emerald-200/90 bg-gradient-to-b from-emerald-50/40 to-white p-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-950 mb-2">
                    <LucideFile className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span>Output files{generatedFiles.length > 0 ? ` (${generatedFiles.length})` : ''}</span>
                </div>
                {generatedFiles.length > 0 ? (
                    <ul className="space-y-2">
                        {generatedFiles.map((f) => (
                            <li
                                key={f.filePath}
                                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded border border-emerald-100 bg-white/90 px-2 py-1.5 text-xs"
                            >
                                <button
                                    type="button"
                                    className="text-emerald-800 hover:underline font-medium break-all text-left bg-transparent border-0 p-0 cursor-pointer"
                                    onClick={() => void openOutputFile(f)}
                                >
                                    {f.fileName || f.filePath}
                                </button>
                                <span className="text-gray-500 shrink-0">
                                    {formatOpencodeFileSize(f.size)}
                                    {f.contentType ? ` · ${f.contentType}` : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-[11px] text-gray-600 leading-relaxed">
                        {errorText
                            ? 'Fix the error above, then refresh — file links load from the server with your session.'
                            : hasRunningTask
                              ? 'OpenCode is still running. PDFs and other artifacts appear here after the task finishes and files are saved to your account.'
                              : tasks.length > 0 && hasDoneTaskWithSummary
                                ? 'No files were stored for this run yet. Open a task below and check the summary, or expand “Instruction & agent messages” for errors. The agent may have only created a helper script instead of the final PDF.'
                                : tasks.length > 0
                                  ? 'No files yet. Complete the pending tasks first.'
                                  : 'No OpenCode run for this thread yet. Generated files will be listed here with open/download actions.'}
                    </div>
                )}
            </div>

            {tasks.length === 0 && !errorText && (
                <div className="mt-2 text-xs text-gray-600">No OpenCode tasks yet.</div>
            )}

            {tasks.length > 0 && (
                <div className="mt-2 space-y-2">
                    {tasks.length > 1 &&
                        tasks.some((t) => t.status === 'pending') &&
                        tasks.some((t) => t.status === 'running') && (
                            <div className="text-[10px] text-gray-600 rounded border border-blue-100 bg-white/80 px-2 py-1.5">
                                Tasks run <span className="font-medium">one at a time</span>. &quot;Pending&quot; is
                                normal until the current task finishes (OpenCode work can take several minutes).
                            </div>
                        )}
                    {sdkSessionId.length > 0 && (
                        <div className="rounded border border-blue-100 bg-white px-2 py-1.5 text-[10px] text-gray-600">
                            <span className="font-medium text-gray-700">OpenCode session ID</span>
                            <div className="mt-0.5 font-mono text-[10px] break-all text-gray-800">{sdkSessionId}</div>
                        </div>
                    )}
                    {tasks.map((t) => (
                        <div key={t.id} className="rounded border border-blue-100 bg-white p-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-medium text-gray-900">{t.title || 'Task'}</div>
                                <div className="text-[11px] text-gray-600 text-right leading-tight">
                                    <div className="capitalize">{t.status}</div>
                                    {(() => {
                                        const exec = getOpencodeTaskExecutionLabel(t, tickNow);
                                        return exec ? (
                                            <div className="text-[10px] text-gray-500 font-normal">{exec}</div>
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                            {(t.summary || t.errorReason) && (
                                <div className="mt-1 text-xs text-gray-800 whitespace-pre-wrap">
                                    {t.errorReason ? t.errorReason : t.summary}
                                </div>
                            )}
                            {(t.instruction?.trim().length > 0 || (t.agentTranscript || '').trim().length > 0) && (
                                <details className="mt-2 group rounded border border-blue-100/80 bg-slate-50/50 open:bg-white">
                                    <summary className="cursor-pointer list-none px-2 py-1.5 text-[11px] font-medium text-blue-800 hover:bg-blue-50/60 rounded [&::-webkit-details-marker]:hidden flex items-center gap-1.5">
                                        <span className="inline-block w-0 h-0 border-l-[5px] border-l-blue-700 border-y-[3.5px] border-y-transparent group-open:rotate-90 transition-transform" />
                                        Instruction & agent messages
                                    </summary>
                                    <div className="px-2 pb-2 pt-0 space-y-2 border-t border-blue-100/60">
                                        {t.instruction?.trim().length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-semibold text-gray-600 mt-2 mb-0.5">
                                                    Instruction
                                                </div>
                                                <pre className="text-[10px] text-gray-800 whitespace-pre-wrap font-mono leading-snug max-h-48 overflow-y-auto">
                                                    {t.instruction}
                                                </pre>
                                            </div>
                                        )}
                                        {(t.agentTranscript || '').trim().length > 0 ? (
                                            <div>
                                                <div className="text-[10px] font-semibold text-gray-600 mb-0.5">
                                                    Agent (OpenCode)
                                                </div>
                                                <pre className="text-[10px] text-gray-800 whitespace-pre-wrap font-mono leading-snug max-h-64 overflow-y-auto">
                                                    {t.agentTranscript}
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-gray-500 italic pt-1">
                                                Agent message log appears here after this task completes.
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                            {Array.isArray(t.outputFileRefs) && t.outputFileRefs.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="text-[11px] font-medium text-gray-600">Output</div>
                                    {t.outputFileRefs.map((f) => (
                                        <div key={f.filePath} className="text-xs pl-1 border-l-2 border-blue-100">
                                            <button
                                                type="button"
                                                className="text-blue-700 hover:underline break-all text-left bg-transparent border-0 p-0 cursor-pointer"
                                                onClick={() => void openOutputFile(f)}
                                            >
                                                {f.fileName || f.filePath}
                                            </button>
                                            <span className="text-gray-500 ml-1">
                                                ({formatOpencodeFileSize(f.size)})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

