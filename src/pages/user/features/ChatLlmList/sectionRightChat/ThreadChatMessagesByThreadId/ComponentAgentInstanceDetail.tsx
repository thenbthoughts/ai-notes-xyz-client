import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import {
    fetchAgentInstanceById,
    type AgentInstanceDetail,
} from '../../utils/answerMachinePollingAxios';
import ComponentAgentLogPanel from './ComponentAgentLogPanel.tsx';
import ComponentAgentMemoryPanel from './ComponentAgentMemoryPanel.tsx';
import ComponentAgentResearchState from './ComponentAgentResearchState.tsx';
import ComponentAgentUsagePanel from './ComponentAgentUsagePanel.tsx';

export default function ComponentAgentInstanceDetail({
    threadId,
    instanceId,
    refreshKey,
}: {
    threadId: string;
    instanceId: string;
    refreshKey?: number;
}) {
    const [detail, setDetail] = useState<AgentInstanceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const detailRef = useRef(detail);
    detailRef.current = detail;

    const loadDetail = useCallback(
        async (isRefresh = false) => {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            try {
                const next = await fetchAgentInstanceById(threadId, instanceId);
                setDetail(next);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [threadId, instanceId]
    );

    useEffect(() => {
        void loadDetail(false);
    }, [loadDetail]);

    useEffect(() => {
        if (refreshKey == null) return;
        if (detailRef.current && detailRef.current.status !== 'pending') return;
        void loadDetail(true);
    }, [refreshKey, loadDetail]);

    useEffect(() => {
        if (detail?.status !== 'pending') return undefined;
        const timer = window.setInterval(() => {
            void loadDetail(true);
        }, 2000);
        return () => window.clearInterval(timer);
    }, [detail?.status, loadDetail]);

    if (loading && !detail) {
        return (
            <div className="flex items-center gap-1 py-1 text-[10px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading instance…
            </div>
        );
    }

    if (!detail) {
        return <p className="py-1 text-[10px] text-zinc-500">Could not load this instance.</p>;
    }

    const memoryByType = detail.memoryStats?.byType || {};
    const rootGoals = detail.goals.filter((g) => !g.parentGoalId);
    const latestUpdate = detail.updates[detail.updates.length - 1]?.message || '';

    return (
        <div className="min-w-0 space-y-1.5">
            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => void loadDetail(true)}
                    disabled={refreshing}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-teal-300 disabled:opacity-50 sm:h-7 sm:w-7"
                    title="Refresh instance"
                    aria-label="Refresh instance"
                >
                    <RefreshCw className={`h-3.5 w-3.5 sm:h-3 sm:w-3 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            {Object.keys(memoryByType).length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {Object.entries(memoryByType).map(([type, count]) => (
                        <span
                            key={type}
                            className="rounded-full bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:py-px sm:text-[9px]"
                        >
                            {type} {count}
                        </span>
                    ))}
                </div>
            ) : null}
            {detail.activeSkillNames.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {detail.activeSkillNames.map((skill) => (
                        <span
                            key={skill}
                            className="max-w-full break-all rounded-full border border-teal-200/70 bg-teal-950/40 px-1.5 py-0.5 font-mono text-[10px] text-teal-300 sm:py-px sm:text-[9px]"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            ) : null}
            {rootGoals.length > 0 ? (
                <ul className="space-y-1">
                    {rootGoals.map((g) => {
                        const children = detail.goals.filter((c) => c.parentGoalId === g.id);
                        return (
                            <li key={g.id} className="break-words text-[11px] leading-snug text-zinc-400 sm:text-[10px]">
                                <span className="font-medium capitalize text-zinc-200">{g.status}</span>
                                {': '}
                                {g.title}
                                {children.length > 0 ? (
                                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-zinc-700 pl-2">
                                        {children.map((c) => (
                                            <li key={c.id} className="break-words">
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
            {latestUpdate ? (
                <p className="break-words rounded-md bg-zinc-900/60 px-1.5 py-1 text-[11px] leading-snug text-zinc-500 ring-1 ring-zinc-800 sm:text-[10px]">
                    {latestUpdate}
                </p>
            ) : null}
            <ComponentAgentUsagePanel
                label="Usage"
                tokenUsage={detail.tokenUsage}
                budget={detail.budget}
            />
            <ComponentAgentResearchState researchState={detail.researchState} />
            <div className="space-y-0.5 border-t border-teal-800/80 pt-1">
                <ComponentAgentMemoryPanel
                    memories={detail.memories || []}
                    memoryCount={detail.memoryCount}
                />
                <ComponentAgentLogPanel logs={detail.logs || []} />
            </div>
        </div>
    );
}
