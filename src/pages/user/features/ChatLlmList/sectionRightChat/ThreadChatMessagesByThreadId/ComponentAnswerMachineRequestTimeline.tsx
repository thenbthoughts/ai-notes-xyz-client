import { useCallback, useEffect, useMemo, useState } from 'react';
import { LucideGitBranch, LucideLoader2, LucideRefreshCw, Layers } from 'lucide-react';
import {
    pollAnswerMachineRequestV3List,
    type AnswerMachineRequestV3PollRow,
    type AnswerMachineRequestV3UnionThreadItem,
} from '../../utils/answerMachineRequestV3TimelineAxios';

const POLL_MS = 10_000;

function pollRowsToUnionItems(rows: AnswerMachineRequestV3PollRow[]): AnswerMachineRequestV3UnionThreadItem[] {
    return rows.map((r) => ({
        unionKind: 'am3_request' as const,
        sortAt: r.createdAt,
        request: {
            _id: r._id,
            parentMessageId: r.parentMessageId,
            status: r.status,
            errorReason: r.errorReason,
            currentIteration: r.currentIteration,
            maxNumberOfIterations: r.maxNumberOfIterations,
            totalTokens: r.totalTokens,
            costInUsd: r.costInUsd,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        },
    }));
}

function mergeThreadAndRequests(
    thread: AnswerMachineRequestV3UnionThreadItem | null,
    requests: AnswerMachineRequestV3UnionThreadItem[]
): AnswerMachineRequestV3UnionThreadItem[] {
    const merged: AnswerMachineRequestV3UnionThreadItem[] = [];
    if (thread) merged.push(thread);
    merged.push(...requests);
    merged.sort((a, b) => new Date(a.sortAt).getTime() - new Date(b.sortAt).getTime());
    return merged;
}

function answerEngineLabel(engine: string): string {
    const map: Record<string, string> = {
        answerMachine3: 'Answer Machine 3',
        answerMachine: 'Answer Machine',
        conciseAnswer: 'Standard chat',
    };
    return map[engine] ?? engine;
}

function formatWhen(iso: string) {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

/** Thread + AM3 requests timeline (data from chat load + live refresh). */
export default function ComponentAnswerMachineRequestTimeline({
    threadId,
    unionFromNotes,
    onNotesRefresh,
}: {
    threadId: string;
    /** `null` until first chat load returns timeline for this thread. */
    unionFromNotes: AnswerMachineRequestV3UnionThreadItem[] | null;
    onNotesRefresh: () => void;
}) {
    const [threadRow, setThreadRow] = useState<AnswerMachineRequestV3UnionThreadItem | null>(null);
    const [requestItems, setRequestItems] = useState<AnswerMachineRequestV3UnionThreadItem[]>([]);
    const [pollRefreshing, setPollRefreshing] = useState(false);

    useEffect(() => {
        if (unionFromNotes === null) {
            return;
        }
        const tr = unionFromNotes.find((i) => i.unionKind === 'thread') ?? null;
        const reqs = unionFromNotes.filter((i) => i.unionKind === 'am3_request');
        setThreadRow(tr);
        setRequestItems(reqs);
    }, [unionFromNotes]);

    const pollRequests = useCallback(async () => {
        if (!threadId) return;
        try {
            setPollRefreshing(true);
            const { requests } = await pollAnswerMachineRequestV3List(threadId);
            setRequestItems(pollRowsToUnionItems(requests));
        } catch {
            /* leave previous rows */
        } finally {
            setPollRefreshing(false);
        }
    }, [threadId]);

    useEffect(() => {
        if (!threadId) return;
        void pollRequests();
        const id = setInterval(() => {
            void pollRequests();
        }, POLL_MS);
        return () => clearInterval(id);
    }, [threadId, pollRequests]);

    const timeline = useMemo(
        () => mergeThreadAndRequests(threadRow, requestItems),
        [threadRow, requestItems]
    );

    if (unionFromNotes === null) {
        return (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-zinc-500">
                <LucideLoader2 className="h-4 w-4 animate-spin text-teal-600" />
                Loading Answer Machine activity…
            </div>
        );
    }

    return (
        <div className="w-full px-2 py-3">
            <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-zinc-50/90 p-3 shadow-sm ring-1 ring-violet-900/[0.04]">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                        <Layers className="h-4 w-4 text-violet-600" />
                        Thread + Answer Machine
                    </div>
                    <div className="flex items-center gap-2">
                        {pollRefreshing ? <LucideLoader2 className="h-4 w-4 animate-spin text-violet-600" /> : null}
                        <button
                            type="button"
                            title="Refresh"
                            className="rounded-lg p-1 text-violet-700 hover:bg-violet-100/80"
                            onClick={() => onNotesRefresh()}
                        >
                            <LucideRefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {timeline.length === 0 && (
                        <p className="text-xs text-zinc-500">No timeline rows yet.</p>
                    )}
                    {timeline.map((row) => {
                        if (row.unionKind === 'thread' && row.thread) {
                            const t = row.thread;
                            return (
                                <div
                                    key={`thread-${t._id}`}
                                    className="rounded-lg border border-zinc-200/80 bg-white/90 px-3 py-2 text-xs text-zinc-800"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-zinc-900">{t.threadTitle || 'Untitled thread'}</span>
                                        <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-800">
                                            {answerEngineLabel(t.answerEngine)}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-[11px] text-zinc-500">
                                        {t.createdAtUtc && <span>Created {formatWhen(t.createdAtUtc)} · </span>}
                                        {t.updatedAtUtc && <span>Updated {formatWhen(t.updatedAtUtc)}</span>}
                                    </div>
                                </div>
                            );
                        }
                        if (row.unionKind === 'am3_request' && row.request) {
                            const r = row.request;
                            return (
                                <div
                                    key={`req-${r._id}`}
                                    className="rounded-lg border border-teal-200/70 bg-teal-50/40 px-3 py-2 text-xs text-zinc-800"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <LucideGitBranch className="h-3.5 w-3.5 text-teal-700" />
                                        <span className="text-[11px] font-semibold text-teal-900">Answer Machine run</span>
                                        <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                                            {r.status}
                                        </span>
                                        <span className="text-[11px] text-zinc-600">
                                            Iteration {r.currentIteration}/{r.maxNumberOfIterations}
                                        </span>
                                        <span className="text-[11px] text-zinc-500">{formatWhen(r.createdAt)}</span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-600">
                                        <span>{r.totalTokens.toLocaleString()} tokens</span>
                                        <span>${r.costInUsd.toFixed(6)}</span>
                                    </div>
                                    {r.errorReason ? (
                                        <div className="mt-1 whitespace-pre-wrap text-[11px] text-red-700">{r.errorReason}</div>
                                    ) : null}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
