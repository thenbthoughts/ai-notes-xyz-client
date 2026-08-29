import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { AgentPollingResponse } from '../../utils/answerMachinePollingAxios';

type ResearchState = NonNullable<AgentPollingResponse['researchState']>;

const phaseLabel = (phase: ResearchState['phase']): string => {
    if (phase === 'plan') return 'Planning';
    if (phase === 'tool') return 'Searching';
    if (phase === 'verify') return 'Verifying';
    if (phase === 'synthesize') return 'Writing answer';
    if (phase === 'done') return 'Done';
    if (phase === 'error') return 'Error';
    return 'Idle';
};

const confidenceClass = (c: ResearchState['confidence']): string => {
    if (c === 'high') return 'bg-emerald-950/40 text-emerald-400 ring-emerald-200/70';
    if (c === 'medium') return 'bg-amber-950/40 text-amber-700 ring-amber-200/70';
    return 'bg-zinc-800 text-zinc-400 ring-zinc-700/70';
};

export default function ComponentAgentResearchState({
    researchState,
}: {
    researchState?: ResearchState | null;
}) {
    const [openBrief, setOpenBrief] = useState(false);

    if (!researchState || researchState.phase === 'idle') {
        return null;
    }

    return (
        <div className="mt-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1">
                <span className="rounded-full bg-teal-900/40 px-1.5 py-px text-[9px] font-medium text-teal-300">
                    {phaseLabel(researchState.phase)}
                </span>
                <span
                    className={`rounded-full px-1.5 py-px text-[9px] font-medium ring-1 ${confidenceClass(
                        researchState.confidence
                    )}`}
                >
                    evidence {researchState.confidence}
                </span>
                {researchState.lastVerifyVerdict ? (
                    <span className="rounded-full bg-zinc-800 px-1.5 py-px text-[9px] text-zinc-500">
                        {researchState.lastVerifyVerdict.replace(/_/g, ' ')}
                    </span>
                ) : null}
            </div>

            {researchState.sourcesSeen.length > 0 ? (
                <div className="flex flex-wrap gap-0.5">
                    {researchState.sourcesSeen.map((src) => (
                        <span
                            key={src}
                            className="rounded-full border border-teal-200/60 bg-zinc-900/70 px-1.5 py-px text-[9px] text-teal-300"
                        >
                            {src}
                        </span>
                    ))}
                </div>
            ) : null}

            {researchState.suggestedNextAction ? (
                <p className="break-words text-[11px] leading-snug text-zinc-500 sm:text-[10px]">
                    Next:{' '}
                    <span className="font-medium text-zinc-300">
                        {researchState.suggestedNextAction}
                    </span>
                    {researchState.suggestedQuery
                        ? ` · “${researchState.suggestedQuery.slice(0, 80)}${
                              researchState.suggestedQuery.length > 80 ? '…' : ''
                          }”`
                        : ''}
                </p>
            ) : null}

            {researchState.evidenceGaps.length > 0 ? (
                <p className="break-words text-[10px] leading-snug text-amber-700/90 sm:text-[9px]">
                    Gaps: {researchState.evidenceGaps.slice(0, 2).join(' · ')}
                </p>
            ) : null}

            {researchState.researchBriefPreview ? (
                <div>
                    <button
                        type="button"
                        onClick={() => setOpenBrief((v) => !v)}
                        className="group flex w-full items-center gap-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-teal-950/50"
                        aria-expanded={openBrief}
                    >
                        <ChevronRight
                            className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform duration-200 ${
                                openBrief ? 'rotate-90 text-teal-400' : ''
                            }`}
                        />
                        <span className="text-[10px] font-medium text-zinc-400">
                            Reasoning trace
                        </span>
                    </button>
                    {openBrief ? (
                        <p className="mt-0.5 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-md bg-zinc-900/80 px-1.5 py-1 text-[10px] leading-snug text-zinc-400 ring-1 ring-zinc-700/60">
                            {researchState.researchBriefPreview}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
