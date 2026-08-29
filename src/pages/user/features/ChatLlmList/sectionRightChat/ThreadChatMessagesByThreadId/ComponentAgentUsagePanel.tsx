import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { AgentPollingResponse } from '../../utils/answerMachinePollingAxios';

type TokenUsage = NonNullable<AgentPollingResponse['tokenUsage']>;
type Budget = NonNullable<AgentPollingResponse['budget']>;

const fmt = (n: number): string => (Number(n) || 0).toLocaleString();

const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-md bg-zinc-900/80 px-1.5 py-1 ring-1 ring-zinc-700/60">
        <div className="text-[9px] leading-none tracking-wide text-zinc-400">{label}</div>
        <div className="mt-0.5 font-mono text-[10px] tabular-nums leading-tight text-zinc-200">
            {value}
        </div>
    </div>
);

export default function ComponentAgentUsagePanel({
    tokenUsage,
    budget,
    label = 'Usage',
}: {
    tokenUsage?: TokenUsage | null;
    budget?: Budget | null;
    label?: string;
}) {
    const [open, setOpen] = useState(false);

    if (!tokenUsage && !budget) return null;

    const total = tokenUsage?.total || 0;
    const cost = tokenUsage?.costInUsd || 0;
    const llmRequests = tokenUsage?.llmRequestCount || 0;
    const hasUsage =
        total > 0 ||
        cost > 0 ||
        llmRequests > 0 ||
        Boolean(tokenUsage?.prompt || tokenUsage?.completion);
    const hasBudget = Boolean(budget);

    if (!hasUsage && !hasBudget) return null;

    const summaryParts: string[] = [];
    if (hasUsage) {
        const requestPart = llmRequests > 0 ? `${fmt(llmRequests)} llm · ` : '';
        summaryParts.push(
            `${requestPart}${fmt(total)} tok` + (cost > 0 ? ` · $${cost.toFixed(4)}` : '')
        );
    }
    if (budget) {
        summaryParts.push(
            `tok ${budget.tokens.pctUsed.toFixed(0)}%` +
                ` · iter ${budget.iterations.used}/${budget.iterations.max}` +
                ` (${budget.iterations.pctRemaining.toFixed(0)}% left)`
        );
    }
    const summary = summaryParts.join(' · ');

    return (
        <div className="mt-1.5">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="group flex min-h-8 w-full items-start gap-1.5 rounded-md px-1 py-1 text-left transition hover:bg-teal-950/60 sm:min-h-0 sm:items-center sm:py-0.5"
                aria-expanded={open}
            >
                <ChevronRight
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-teal-400 sm:mt-0 sm:h-3 sm:w-3 ${
                        open ? 'rotate-90 text-teal-400' : ''
                    }`}
                />
                <span className="shrink-0 text-[11px] font-medium text-zinc-400 sm:text-[10px]">
                    {label}
                </span>
                <span className="min-w-0 flex-1 text-right font-mono text-[10px] leading-snug tabular-nums text-zinc-400 break-words sm:ml-auto sm:text-right">
                    {summary}
                </span>
            </button>
            {open ? (
                <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg bg-gradient-to-b from-zinc-950 to-zinc-900 p-1.5 ring-1 ring-zinc-700/70 sm:grid-cols-3">
                    {tokenUsage ? (
                        <>
                            <Stat label="LLM requests" value={fmt(tokenUsage.llmRequestCount || 0)} />
                            <Stat label="Input" value={fmt(tokenUsage.prompt)} />
                            <Stat label="Output" value={fmt(tokenUsage.completion)} />
                            <Stat
                                label="Max in / query"
                                value={fmt(tokenUsage.maxPromptPerQuery || 0)}
                            />
                            <Stat
                                label="Max out / query"
                                value={fmt(tokenUsage.maxCompletionPerQuery || 0)}
                            />
                            <Stat label="Total" value={fmt(tokenUsage.total)} />
                            <Stat
                                label="Cost"
                                value={cost > 0 ? `$${cost.toFixed(6)}` : '$0'}
                            />
                            {(tokenUsage.reasoning || 0) > 0 ? (
                                <Stat label="Reasoning" value={fmt(tokenUsage.reasoning)} />
                            ) : null}
                        </>
                    ) : null}
                    {budget ? (
                        <>
                            <Stat
                                label="Tokens used %"
                                value={`${budget.tokens.pctUsed.toFixed(1)}%`}
                            />
                            <Stat
                                label="Tokens left %"
                                value={`${budget.tokens.pctRemaining.toFixed(1)}%`}
                            />
                            <Stat
                                label="Token budget"
                                value={`${fmt(budget.tokens.used)} / ${fmt(budget.tokens.max)}`}
                            />
                            <Stat
                                label="Iter budget"
                                value={`${budget.iterations.used} / ${budget.iterations.max}`}
                            />
                            <Stat
                                label="Iter used %"
                                value={`${budget.iterations.pctUsed.toFixed(1)}%`}
                            />
                            <Stat
                                label="Iter left %"
                                value={`${budget.iterations.pctRemaining.toFixed(1)}%`}
                            />
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
