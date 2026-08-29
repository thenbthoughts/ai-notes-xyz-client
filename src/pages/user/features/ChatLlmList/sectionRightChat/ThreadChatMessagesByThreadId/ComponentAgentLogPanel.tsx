import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { AgentPollingResponse } from '../../utils/answerMachinePollingAxios';

type AgentLogEntry = AgentPollingResponse['logs'][number];

const levelClass = (level: string): string => {
    if (level === 'error') return 'text-red-700';
    if (level === 'warn') return 'text-amber-700';
    if (level === 'debug') return 'text-zinc-400';
    return 'text-zinc-300';
};

const actionBadgeClass = (action: string): string => {
    if (action.includes('error') || action.includes('fail')) {
        return 'bg-red-950/40 text-red-700 ring-red-200/70';
    }
    if (action.startsWith('shell_')) {
        return 'bg-sky-950/40 text-sky-400 ring-sky-800/70';
    }
    if (action.startsWith('llm_')) {
        return 'bg-violet-950/40 text-violet-700 ring-violet-200/70';
    }
    if (action.includes('excel') || action.includes('completed')) {
        return 'bg-teal-950/40 text-teal-400 ring-teal-200/70';
    }
    if (action.includes('cancel') || action.includes('stop')) {
        return 'bg-amber-950/40 text-amber-700 ring-amber-200/70';
    }
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

const formatRaw = (raw: unknown): string => {
    if (raw == null) {
        return '';
    }
    if (typeof raw === 'string') {
        return raw;
    }
    try {
        return JSON.stringify(raw, null, 2);
    } catch {
        return String(raw);
    }
};

const hasDetail = (log: AgentLogEntry): boolean => {
    const rawStr = formatRaw(log.raw);
    const payloadKeys = log.payload && typeof log.payload === 'object' ? Object.keys(log.payload).length : 0;
    const msgDiffers =
        Boolean(log.message) &&
        log.message.trim() !== (log.title || '').trim();
    return Boolean(rawStr) || payloadKeys > 0 || msgDiffers;
};

function AgentLogRow({ log }: { log: AgentLogEntry }) {
    const [open, setOpen] = useState(false);
    const title = (log.title || log.message || log.action || 'log').trim();
    const detailAvailable = hasDetail(log);
    const rawText = formatRaw(log.raw);
    const payloadText = formatRaw(log.payload);

    return (
        <li className="border-b border-zinc-800/80 py-1 last:border-b-0">
            <button
                type="button"
                disabled={!detailAvailable}
                onClick={() => detailAvailable && setOpen((v) => !v)}
                className={`group flex w-full items-start gap-1 rounded-md px-1 py-0.5 text-left transition ${
                    detailAvailable ? 'cursor-pointer hover:bg-zinc-900' : 'cursor-default'
                }`}
                aria-expanded={open}
            >
                <ChevronRight
                    className={`mt-0.5 h-3 w-3 shrink-0 text-zinc-300 transition-transform duration-200 ${
                        detailAvailable ? 'group-hover:text-teal-600' : 'opacity-0'
                    } ${open ? 'rotate-90 text-teal-600' : ''}`}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="font-mono text-[9px] tabular-nums text-zinc-400">
                            {formatTime(log.createdAtUtc)}
                        </span>
                        {log.tickNumber > 0 ? (
                            <span className="rounded bg-zinc-800 px-1 py-px text-[9px] tabular-nums text-zinc-500">
                                t{log.tickNumber}
                            </span>
                        ) : null}
                        <span
                            className={`shrink-0 rounded px-1 py-px text-[9px] font-medium ring-1 ${actionBadgeClass(log.action)}`}
                        >
                            {log.action}
                        </span>
                        {log.past ? (
                            <span className="rounded bg-zinc-800 px-1 py-px text-[9px] font-medium text-zinc-500 ring-1 ring-zinc-700/70">
                                past
                            </span>
                        ) : null}
                    </div>
                    <p className={`mt-0.5 text-[10px] leading-snug ${levelClass(log.level)}`}>
                        {title}
                    </p>
                    {open && detailAvailable ? (
                        <div className="mt-1 space-y-1.5 rounded-md bg-zinc-900 px-1.5 py-1.5 ring-1 ring-zinc-700/60">
                            {log.message ? (
                                <p className="whitespace-pre-wrap break-words text-[10px] leading-snug text-zinc-300">
                                    {log.message}
                                </p>
                            ) : null}
                            {payloadText && payloadText !== '{}' && payloadText !== 'null' ? (
                                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-950 p-1 font-mono text-[9px] leading-snug text-zinc-400">
                                    {payloadText}
                                </pre>
                            ) : null}
                            {rawText ? (
                                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-zinc-900 p-1.5 font-mono text-[9px] leading-snug text-zinc-100">
                                    {rawText}
                                </pre>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </button>
        </li>
    );
}

export default function ComponentAgentLogPanel({
    logs,
}: {
    logs: AgentLogEntry[];
}) {
    const [expanded, setExpanded] = useState(false);

    const ordered = useMemo(() => logs, [logs]);

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
                <span className="text-[10px] font-medium text-zinc-400">Agent log</span>
                <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-px text-[9px] font-medium tabular-nums text-zinc-500">
                    {ordered.length}
                </span>
            </button>
            {expanded ? (
                <ul className="mt-1 max-h-72 space-y-0 overflow-y-auto rounded-lg bg-gradient-to-b from-zinc-950 to-zinc-900 px-1 py-0.5 ring-1 ring-zinc-700/70">
                    {ordered.map((log) => (
                        <AgentLogRow key={log.id} log={log} />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
