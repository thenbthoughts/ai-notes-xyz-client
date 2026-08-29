import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

import type { AgentPollingResponse } from '../../utils/answerMachinePollingAxios';
import ComponentAgentUsagePanel from './ComponentAgentUsagePanel.tsx';

export type AgentInstanceSummary = NonNullable<AgentPollingResponse['instances']>[number];

const statusBadgeClass = (status: AgentInstanceSummary['status']): string => {
    if (status === 'success') return 'bg-emerald-950/40 text-emerald-400 ring-emerald-200/70';
    if (status === 'failed') return 'bg-red-950/40 text-red-400 ring-red-200/70';
    return 'bg-amber-950/40 text-amber-400 ring-amber-200/70';
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

const instanceDurationMs = (item: AgentInstanceSummary, nowMs: number): number => {
    const startMs = item.createdAtUtc ? new Date(item.createdAtUtc).getTime() : 0;
    if (!startMs) return 0;
    if (item.status === 'pending') {
        return Math.max(0, nowMs - startMs);
    }
    if (typeof item.durationMs === 'number' && item.durationMs >= 0) {
        return item.durationMs;
    }
    const endIso = item.completedAtUtc || item.updatedAtUtc;
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

const instanceTitle = (item: AgentInstanceSummary): string => {
    const goal = (item.goalTitle || '').trim();
    if (goal) return goal;
    const summary = (item.summary || '').trim().split('\n')[0] || '';
    if (summary) return summary.slice(0, 80);
    return 'Agent run';
};

function InstanceRow({
    item,
    selected,
    open,
    nowMs,
    budget,
    onToggle,
    children,
}: {
    item: AgentInstanceSummary;
    selected: boolean;
    open: boolean;
    nowMs: number;
    budget?: NonNullable<AgentPollingResponse['budget']> | null;
    onToggle: () => void;
    children?: ReactNode;
}) {
    const preview = (item.summary || item.errorReason || '').trim();
    const started = formatTime(item.createdAtUtc);
    const ended =
        item.status === 'pending'
            ? ''
            : formatTime(item.completedAtUtc || item.updatedAtUtc);
    const duration = formatDuration(instanceDurationMs(item, nowMs));

    return (
        <li className="border-b border-zinc-800/80 py-1 last:border-b-0">
            <button
                type="button"
                onClick={onToggle}
                className={`group flex w-full items-start gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-zinc-900 ${
                    selected ? 'bg-teal-950/40 ring-1 ring-teal-800/60' : ''
                }`}
                aria-expanded={open}
            >
                <ChevronRight
                    className={`mt-0.5 h-3 w-3 shrink-0 text-zinc-300 transition-transform duration-200 group-hover:text-teal-600 ${
                        open ? 'rotate-90 text-teal-600' : ''
                    }`}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="font-mono text-[9px] tabular-nums text-zinc-400">
                            {started}
                            {started ? (
                                <>
                                    {' → '}
                                    {ended || '…'}
                                </>
                            ) : null}
                        </span>
                        <span
                            className={`rounded px-1 py-px text-[9px] font-medium capitalize ring-1 ${statusBadgeClass(
                                item.status
                            )}`}
                        >
                            {item.status}
                        </span>
                        {item.brainStep ? (
                            <span className="rounded bg-sky-950/40 px-1 py-px text-[9px] font-medium text-sky-300 ring-1 ring-sky-800/70">
                                {item.brainStep}
                            </span>
                        ) : null}
                        {item.isLatest ? (
                            <span className="rounded bg-zinc-800 px-1 py-px text-[9px] font-medium text-zinc-400">
                                latest
                            </span>
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-zinc-200">
                            {instanceTitle(item)}
                        </span>
                    </div>
                    {!open && preview ? (
                        <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap break-words text-[10px] leading-snug text-zinc-500">
                            {preview.length > 160 ? `${preview.slice(0, 160)}…` : preview}
                        </p>
                    ) : null}
                    <p className="mt-0.5 font-mono text-[9px] tabular-nums text-zinc-500">
                        {duration ? `${duration} · ` : ''}
                        tick {item.tickCount}
                        {(item.llmRequestCount || 0) > 0
                            ? ` · ${item.llmRequestCount} llm`
                            : ''}
                        {item.totalTokens > 0 ? ` · ${item.totalTokens.toLocaleString()} tok` : ''}
                        {item.costInUsd > 0 ? ` · $${item.costInUsd.toFixed(4)}` : ''}
                    </p>
                </div>
            </button>
            {open ? (
                <div className="mt-1 ml-4 space-y-1">
                    {Object.keys(item.memoryByType || {}).length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                            {Object.entries(item.memoryByType || {}).map(([type, count]) => (
                                <span
                                    key={type}
                                    className="rounded-full bg-zinc-800/90 px-1.5 py-px text-[9px] font-medium text-zinc-400"
                                >
                                    {type} {count}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    {(item.activeSkillNames || []).length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                            {(item.activeSkillNames || []).map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-teal-200/70 bg-teal-950/40 px-1.5 py-px font-mono text-[9px] text-teal-300"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    {(item.goals || []).filter((g) => !g.parentGoalId).length > 0 ? (
                        <ul className="space-y-0.5">
                            {(item.goals || [])
                                .filter((g) => !g.parentGoalId)
                                .map((g) => {
                                    const childrenGoals = (item.goals || []).filter(
                                        (c) => c.parentGoalId === g.id
                                    );
                                    return (
                                        <li key={g.id} className="text-[10px] text-zinc-400">
                                            <span className="font-medium capitalize text-zinc-200">
                                                {g.status}
                                            </span>
                                            {': '}
                                            {g.title}
                                            {childrenGoals.length > 0 ? (
                                                <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-zinc-700 pl-2">
                                                    {childrenGoals.map((c) => (
                                                        <li key={c.id}>
                                                            <span className="font-medium capitalize text-zinc-300">
                                                                {c.status}
                                                            </span>
                                                            {': '}
                                                            {c.title}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </li>
                                    );
                                })}
                        </ul>
                    ) : null}
                    {item.latestUpdate ? (
                        <p className="truncate rounded-md bg-zinc-900/60 px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-zinc-800">
                            {item.latestUpdate}
                        </p>
                    ) : null}
                    {preview ? (
                        <p className="whitespace-pre-wrap break-words rounded-md bg-zinc-900 px-1.5 py-1 text-[10px] leading-snug text-zinc-300 ring-1 ring-zinc-700/60">
                            {preview}
                        </p>
                    ) : null}
                    <ComponentAgentUsagePanel
                        label="Usage"
                        tokenUsage={
                            item.usage || {
                                prompt: 0,
                                completion: 0,
                                reasoning: 0,
                                total: item.totalTokens || 0,
                                costInUsd: item.costInUsd || 0,
                                llmRequestCount: item.llmRequestCount || 0,
                            }
                        }
                        budget={selected ? budget : null}
                    />
                    {selected ? children : null}
                </div>
            ) : null}
        </li>
    );
}

export default function ComponentAgentInstancePanel({
    instances,
    selectedInstanceId,
    onSelectInstance,
    selectedBudget,
    children,
}: {
    instances: AgentInstanceSummary[];
    selectedInstanceId: string | null;
    onSelectInstance: (id: string) => void;
    selectedBudget?: NonNullable<AgentPollingResponse['budget']> | null;
    children?: ReactNode;
}) {
    const [menuOpen, setMenuOpen] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const initializedOpen = useRef(false);
    const ordered = useMemo(() => instances || [], [instances]);
    const hasPending = useMemo(() => ordered.some((item) => item.status === 'pending'), [ordered]);

    useEffect(() => {
        if (!hasPending) return undefined;
        setNowMs(Date.now());
        const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [hasPending]);

    useEffect(() => {
        if (initializedOpen.current) return;
        const initial = selectedInstanceId || ordered[0]?.id || null;
        if (!initial) return;
        setOpenId(initial);
        initializedOpen.current = true;
    }, [selectedInstanceId, ordered]);

    if (ordered.length === 0) {
        return <>{children}</>;
    }

    return (
        <div className="mt-1">
            <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="group flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-teal-950/60"
                aria-expanded={menuOpen}
            >
                <ChevronRight
                    className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-teal-400 ${
                        menuOpen ? 'rotate-90 text-teal-400' : ''
                    }`}
                />
                <span className="text-[10px] font-medium text-zinc-400">Instances</span>
                <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-px text-[9px] font-medium tabular-nums text-zinc-500">
                    {ordered.length}
                </span>
            </button>
            {menuOpen ? (
                <ul className="mt-1 space-y-0 rounded-lg bg-gradient-to-b from-zinc-950 to-zinc-900 px-1 py-0.5 ring-1 ring-zinc-700/70">
                    {ordered.map((item) => (
                        <InstanceRow
                            key={item.id}
                            item={item}
                            selected={item.id === selectedInstanceId}
                            open={item.id === openId}
                            nowMs={nowMs}
                            budget={selectedBudget}
                            onToggle={() => {
                                setOpenId((current) => (current === item.id ? null : item.id));
                                onSelectInstance(item.id);
                            }}
                        >
                            {children}
                        </InstanceRow>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
