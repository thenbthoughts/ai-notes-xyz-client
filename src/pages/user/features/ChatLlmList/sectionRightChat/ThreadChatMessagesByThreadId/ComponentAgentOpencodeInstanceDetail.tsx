import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, HardDrive } from 'lucide-react';

import {
    fetchAgentOpencodeInstanceById,
    type AgentOpencodeInstanceSummary,
    type AgentOpencodePipelineStep,
} from '../../utils/agentOpencodeAxios';

const PIPELINE_STEPS: AgentOpencodePipelineStep[] = ['input', 'settings', 'opencode', 'output'];

const stepLabel = (step: AgentOpencodePipelineStep): string => {
    if (step === 'input') return 'input';
    if (step === 'settings') return 'settings';
    if (step === 'opencode') return 'opencode';
    if (step === 'output') return 'output';
    if (step === 'done') return 'done';
    return 'queued';
};

const PathRow = ({ label, value }: { label: string; value: string }) => {
    if (!value) return null;
    return (
        <div className="min-w-0">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
            <p className="mt-0.5 break-all font-mono text-[10px] leading-snug text-cyan-200/90 sm:text-[9px]">
                {value}
            </p>
        </div>
    );
};

export default function ComponentAgentOpencodeInstanceDetail({
    threadId,
    instanceId,
    refreshKey,
    onOpenFiles,
}: {
    threadId: string;
    instanceId: string;
    refreshKey?: number;
    onOpenFiles?: (relativePath?: string) => void;
}) {
    const [detail, setDetail] = useState<AgentOpencodeInstanceSummary | null>(null);
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
                const next = await fetchAgentOpencodeInstanceById(threadId, instanceId);
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

    const activeStep = detail.pipelineStep === 'done' ? 'output' : detail.pipelineStep;

    return (
        <div className="min-w-0 space-y-1.5">
            <div className="flex items-center justify-end gap-1">
                {onOpenFiles ? (
                    <button
                        type="button"
                        onClick={() =>
                            onOpenFiles(
                                detail.agentWorkspaceRelativePath ||
                                    detail.workspaceRootRelativePath ||
                                    undefined
                            )
                        }
                        className="flex h-8 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium text-cyan-300 transition hover:bg-zinc-800 sm:h-7"
                        title="Open workspace files"
                    >
                        <HardDrive className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                        Files
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => void loadDetail(true)}
                    disabled={refreshing}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-cyan-300 disabled:opacity-50 sm:h-7 sm:w-7"
                    title="Refresh instance"
                    aria-label="Refresh instance"
                >
                    <RefreshCw className={`h-3.5 w-3.5 sm:h-3 sm:w-3 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-1">
                {PIPELINE_STEPS.map((step, index) => {
                    const reached =
                        detail.pipelineStep === 'done' ||
                        PIPELINE_STEPS.indexOf(activeStep as (typeof PIPELINE_STEPS)[number]) >= index;
                    const current = activeStep === step && detail.status === 'pending';
                    return (
                        <span key={step} className="flex items-center gap-1">
                            {index > 0 ? <span className="text-[9px] text-zinc-600">→</span> : null}
                            <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 sm:px-1 sm:py-px sm:text-[9px] ${
                                    current
                                        ? 'bg-cyan-950/60 text-cyan-200 ring-cyan-500/50'
                                        : reached
                                          ? 'bg-cyan-950/30 text-cyan-400 ring-cyan-800/70'
                                          : 'bg-zinc-900 text-zinc-500 ring-zinc-800'
                                }`}
                            >
                                {stepLabel(step)}
                            </span>
                        </span>
                    );
                })}
            </div>

            {detail.promptText ? (
                <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                        Instruction
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words rounded-md bg-zinc-950/70 px-1.5 py-1 text-[11px] leading-snug text-zinc-300 ring-1 ring-zinc-800 sm:text-[10px]">
                        {detail.promptText}
                    </p>
                </div>
            ) : null}

            {detail.errorReason ? (
                <p className="whitespace-pre-wrap break-words rounded-md bg-red-950/40 px-1.5 py-1 text-[11px] leading-snug text-red-300 ring-1 ring-red-900/70 sm:text-[10px]">
                    {detail.errorReason}
                </p>
            ) : null}

            <div className="space-y-1.5 rounded-md bg-zinc-950/50 px-1.5 py-1.5 ring-1 ring-zinc-800">
                <PathRow label="Input" value={detail.inputPromptRelativePath} />
                <PathRow label="Agent workspace" value={detail.agentWorkspaceRelativePath} />
                <PathRow label="Output" value={detail.outputPromptRelativePath} />
            </div>

            {detail.opencodeRunId ? (
                <p className="break-all font-mono text-[10px] text-zinc-500 sm:text-[9px]">
                    OpenCode session {detail.opencodeRunId}
                </p>
            ) : null}

            {detail.outputContent ? (
                <div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                        Output
                    </div>
                    <p className="mt-0.5 max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-zinc-950/70 px-1.5 py-1 text-[11px] leading-snug text-zinc-300 ring-1 ring-zinc-800 sm:text-[10px]">
                        {detail.outputContent}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
