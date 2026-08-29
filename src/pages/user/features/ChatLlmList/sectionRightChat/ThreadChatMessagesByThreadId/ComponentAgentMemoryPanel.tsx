import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { AgentPollingResponse } from '../../utils/answerMachinePollingAxios';

type AgentMemoryEntry = NonNullable<AgentPollingResponse['memories']>[number];

const typeBadgeClass = (memoryType: string): string => {
    if (memoryType === 'fact') return 'bg-emerald-950/40 text-emerald-400 ring-emerald-200/70';
    if (memoryType === 'observation') return 'bg-sky-950/40 text-sky-400 ring-sky-800/70';
    if (memoryType === 'plan') return 'bg-amber-950/40 text-amber-700 ring-amber-200/70';
    if (memoryType === 'result') return 'bg-teal-950/40 text-teal-400 ring-teal-200/70';
    return 'bg-zinc-950 text-zinc-400 ring-zinc-700/70';
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

function MemoryRow({ item }: { item: AgentMemoryEntry }) {
    const [open, setOpen] = useState(false);
    const preview = (item.content || '').trim();
    const hasMore = preview.length > 160;

    return (
        <li className="border-b border-zinc-800/80 py-1 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="group flex w-full items-start gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-zinc-900"
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
                            {formatTime(item.createdAtUtc)}
                        </span>
                        <span
                            className={`rounded px-1 py-px text-[9px] font-medium ring-1 ${typeBadgeClass(item.memoryType)}`}
                        >
                            {item.memoryType || 'other'}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-zinc-200">
                            {item.key || '(untitled)'}
                        </span>
                        {item.past ? (
                            <span className="rounded bg-zinc-800 px-1 py-px text-[9px] font-medium text-zinc-500 ring-1 ring-zinc-700/70">
                                past
                            </span>
                        ) : null}
                    </div>
                    {!open && preview ? (
                        <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap break-words text-[10px] leading-snug text-zinc-500">
                            {hasMore ? `${preview.slice(0, 160)}…` : preview}
                        </p>
                    ) : null}
                    {open ? (
                        <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-zinc-900 px-1.5 py-1 text-[10px] leading-snug text-zinc-300 ring-1 ring-zinc-700/60">
                            {preview || '(empty)'}
                        </p>
                    ) : null}
                </div>
            </button>
        </li>
    );
}

export default function ComponentAgentMemoryPanel({
    memories,
    memoryCount,
}: {
    memories: AgentMemoryEntry[];
    memoryCount?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const ordered = useMemo(() => memories || [], [memories]);
    const total = typeof memoryCount === 'number' ? memoryCount : ordered.length;

    if (ordered.length === 0) {
        return null;
    }

    return (
        <div className="mt-1">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="group flex min-h-8 w-full items-center gap-1 rounded-md px-1 py-1 text-left transition hover:bg-teal-950/60 sm:min-h-0 sm:py-0.5"
                aria-expanded={expanded}
            >
                <ChevronRight
                    className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-teal-400 ${
                        expanded ? 'rotate-90 text-teal-400' : ''
                    }`}
                />
                <span className="text-[10px] font-medium text-zinc-400">Findings / memory</span>
                <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-px text-[9px] font-medium tabular-nums text-zinc-500">
                    {ordered.length}
                    {total > ordered.length ? `/${total}` : ''}
                </span>
            </button>
            {expanded ? (
                <ul className="mt-1 max-h-64 space-y-0 overflow-y-auto rounded-lg bg-gradient-to-b from-zinc-950 to-zinc-900 px-1 py-0.5 ring-1 ring-zinc-700/70">
                    {ordered.map((item) => (
                        <MemoryRow key={item.id} item={item} />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
