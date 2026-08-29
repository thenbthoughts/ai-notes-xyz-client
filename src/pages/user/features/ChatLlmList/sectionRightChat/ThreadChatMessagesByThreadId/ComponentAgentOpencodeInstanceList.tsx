import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

import {
    fetchAgentOpencodeInstanceList,
    type AgentOpencodeInstanceStatus,
    type AgentOpencodeInstanceSummary,
} from '../../utils/agentOpencodeAxios';
import ComponentAgentOpencodeInstanceDetail from './ComponentAgentOpencodeInstanceDetail.tsx';

const statusBadgeClass = (status: AgentOpencodeInstanceStatus): string => {
    if (status === 'filesInitialized') return 'bg-emerald-950/40 text-emerald-400 ring-emerald-200/70';
    if (status === 'failed') return 'bg-red-950/40 text-red-400 ring-red-200/70';
    return 'bg-amber-950/40 text-amber-400 ring-amber-200/70';
};

const statusLabel = (status: AgentOpencodeInstanceStatus): string => {
    if (status === 'filesInitialized') return 'done';
    return status;
};

const formatTime = (iso: string): string => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch {
        return '';
    }
};

const instanceDurationMs = (item: AgentOpencodeInstanceSummary, nowMs: number): number => {
    const startMs = item.createdAtUtc ? new Date(item.createdAtUtc).getTime() : 0;
    if (!startMs) return 0;
    if (item.status === 'pending') {
        return Math.max(0, nowMs - startMs);
    }
    const endIso = item.filesInitializedAtUtc || item.updatedAtUtc;
    const endMs = endIso ? new Date(endIso).getTime() : nowMs;
    return Math.max(0, endMs - startMs);
};

const formatDuration = (ms: number): string => {
    if (!Number.isFinite(ms) || ms < 0) return '';
    const totalSec = ms / 1000;
    if (totalSec < 10) return `${totalSec.toFixed(1)}s`;
    if (totalSec < 60) return `${Math.round(totalSec)}s`;
    const sec = Math.round(totalSec);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
        if (minutes === 0 && seconds === 0) return `${hours}h`;
        if (seconds === 0) return `${hours}h ${minutes}m`;
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

const instanceTitle = (item: AgentOpencodeInstanceSummary): string => {
    const prompt = (item.promptText || '').trim().split('\n')[0] || '';
    if (prompt) return prompt.slice(0, 80);
    return 'Opencode run';
};

export default function ComponentAgentOpencodeInstanceList({
    threadId,
    refreshKey,
    snapshotInstances,
    onOpenFiles,
}: {
    threadId: string;
    refreshKey?: number;
    snapshotInstances?: AgentOpencodeInstanceSummary[];
    onOpenFiles?: (relativePath?: string) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(true);
    const [instances, setInstances] = useState<AgentOpencodeInstanceSummary[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);
    const [listRefreshing, setListRefreshing] = useState(false);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const hasPending = useMemo(
        () =>
            instances.some((item) => item.status === 'pending') ||
            Boolean(snapshotInstances?.some((item) => item.status === 'pending')),
        [instances, snapshotInstances]
    );

    const loadList = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!opts?.silent) {
                setListRefreshing(true);
            }
            try {
                const next = await fetchAgentOpencodeInstanceList(threadId);
                setInstances(next);
            } catch {
                /* ignore */
            } finally {
                if (!opts?.silent) {
                    setListRefreshing(false);
                }
            }
        },
        [threadId]
    );

    useEffect(() => {
        void loadList({ silent: true });
    }, [loadList, refreshKey]);

    useEffect(() => {
        if (!snapshotInstances) return;
        setInstances(snapshotInstances);
    }, [snapshotInstances]);

    useEffect(() => {
        if (!hasPending) return undefined;
        const timer = window.setInterval(() => {
            void loadList({ silent: true });
        }, 2000);
        return () => window.clearInterval(timer);
    }, [hasPending, loadList]);

    useEffect(() => {
        if (!hasPending) return undefined;
        setNowMs(Date.now());
        const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [hasPending]);

    const handleExpand = (id: string) => {
        setOpenId((current) => (current === id ? null : id));
    };

    return (
        <div className="mt-1 min-w-0">
            <div className="mt-1 flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="group flex min-h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1 text-left transition hover:bg-cyan-950/60 sm:min-h-0 sm:py-0.5"
                    aria-expanded={menuOpen}
                >
                    <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-cyan-400 sm:h-3 sm:w-3 ${
                            menuOpen ? 'rotate-90 text-cyan-400' : ''
                        }`}
                    />
                    <span className="text-[11px] font-medium text-zinc-400 sm:text-[10px]">
                        Instances
                    </span>
                    <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 sm:py-px sm:text-[9px]">
                        {instances.length}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => void loadList()}
                    disabled={listRefreshing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-cyan-300 disabled:opacity-50 sm:h-7 sm:w-7"
                    title="Refresh instances"
                    aria-label="Refresh instances"
                >
                    <RefreshCw className={`h-3.5 w-3.5 sm:h-3 sm:w-3 ${listRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            {menuOpen ? (
                <ul className="mt-1 space-y-0 rounded-lg bg-gradient-to-b from-zinc-950 to-zinc-900 px-1 py-0.5 ring-1 ring-zinc-700/70">
                    {instances.length === 0 ? (
                        <li className="px-1 py-2 text-[11px] text-zinc-500">No Opencode runs yet.</li>
                    ) : null}
                    {instances.map((item) => {
                        const open = item.id === openId;
                        const started = formatTime(item.createdAtUtc);
                        const ended =
                            item.status === 'pending'
                                ? ''
                                : formatTime(item.filesInitializedAtUtc || item.updatedAtUtc);
                        const duration = formatDuration(instanceDurationMs(item, nowMs));
                        return (
                            <li key={item.id} className="border-b border-zinc-800/80 py-1 last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => handleExpand(item.id)}
                                    className={`group flex w-full items-start gap-1.5 rounded-md px-1 py-1.5 text-left transition hover:bg-zinc-900 sm:py-1 ${
                                        open ? 'bg-cyan-950/40 ring-1 ring-cyan-800/60' : ''
                                    }`}
                                    aria-expanded={open}
                                >
                                    <ChevronRight
                                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300 transition-transform duration-200 group-hover:text-cyan-500 sm:h-3 sm:w-3 ${
                                            open ? 'rotate-90 text-cyan-400' : ''
                                        }`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                            <span className="font-mono text-[10px] tabular-nums text-zinc-400 sm:text-[9px]">
                                                {started}
                                                {started ? (
                                                    <>
                                                        {' → '}
                                                        {ended || '…'}
                                                    </>
                                                ) : null}
                                            </span>
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ring-1 sm:px-1 sm:py-px sm:text-[9px] ${statusBadgeClass(
                                                    item.status
                                                )}`}
                                            >
                                                {statusLabel(item.status)}
                                            </span>
                                            {item.pipelineStep ? (
                                                <span className="rounded bg-cyan-950/40 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300 ring-1 ring-cyan-800/70 sm:px-1 sm:py-px sm:text-[9px]">
                                                    {item.pipelineStep}
                                                </span>
                                            ) : null}
                                            {item.statusIsRunning ? (
                                                <span className="rounded bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-800/70 sm:px-1 sm:py-px sm:text-[9px]">
                                                    running
                                                </span>
                                            ) : null}
                                            {item.isLatest ? (
                                                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:px-1 sm:py-px sm:text-[9px]">
                                                    latest
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 break-words text-[12px] font-medium leading-snug text-zinc-200 sm:mt-0.5 sm:truncate sm:text-[11px]">
                                            {instanceTitle(item)}
                                        </p>
                                        <p className="mt-0.5 font-mono text-[10px] leading-snug tabular-nums text-zinc-500 break-words sm:text-[9px]">
                                            {duration ? `${duration} · ` : ''}
                                            input → settings → opencode → output
                                        </p>
                                    </div>
                                </button>
                                {open ? (
                                    <div className="mt-1 ml-2 min-w-0 sm:ml-4">
                                        <ComponentAgentOpencodeInstanceDetail
                                            threadId={threadId}
                                            instanceId={item.id}
                                            refreshKey={refreshKey}
                                            onOpenFiles={onOpenFiles}
                                        />
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
