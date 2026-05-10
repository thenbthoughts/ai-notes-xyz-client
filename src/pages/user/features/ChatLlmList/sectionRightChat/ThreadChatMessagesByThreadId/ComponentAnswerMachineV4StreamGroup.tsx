import { useMemo, useRef, useState } from 'react';
import { LucideChevronDown, LucideChevronRight, LucideCopy, LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../../config/axiosCustom';
import type { AnswerMachineV4StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import {
    AnswerMachineV4FileArtifacts,
    AnswerMachineV4FinalAnswerRow,
    AnswerMachineV4IterationCollapsible,
    AnswerMachineV4SubQuestionCollapsible,
} from './AnswerMachineV4StreamStep';
import { groupAnswerMachineV4PipelineItems } from './groupAnswerMachineV4PipelineItems';

function inferAm4UploadTarget(items: tsMessageItem[]): { requestId: string; iteration: number } | null {
    let requestId: string | null = null;
    let maxIter = 0;
    for (const m of items) {
        const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp) {
            continue;
        }
        if ('requestId' in sp && typeof sp.requestId === 'string' && sp.requestId) {
            requestId = sp.requestId;
        }
        if (sp.kind === 'iteration' && typeof sp.iterationNumber === 'number') {
            maxIter = Math.max(maxIter, sp.iterationNumber);
        }
    }
    if (!requestId) {
        return null;
    }
    return { requestId, iteration: maxIter > 0 ? maxIter : 1 };
}

function AnswerMachineV4AttachFileBar({
    threadId,
    items,
    onUploaded,
}: {
    threadId: string;
    items: tsMessageItem[];
    onUploaded?: () => void;
}) {
    const target = useMemo(() => inferAm4UploadTarget(items), [items]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);

    const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        setBusy(true);
        setProgress('Uploading to Shell workspace…');
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('threadId', threadId);
            if (target?.requestId) {
                fd.append('answerMachineRequestV4Id', target.requestId);
            }
            await axiosCustom.post('/api/chat-llm/crud/answerMachineFileV4Upload', fd, {
                onUploadProgress: (ev) => {
                    if (ev.total) {
                        const pct = Math.round((ev.loaded / ev.total) * 100);
                        setProgress(`Uploading… ${pct}%`);
                    }
                },
            });
            toast.success('File saved to workspace. Refreshing chat…');
            onUploaded?.();
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        } finally {
            setBusy(false);
            setProgress(null);
        }
    };

    return (
        <div className="not-prose mt-2 flex flex-wrap items-center gap-2 border-t border-fuchsia-100/80 pt-2 text-[11px] text-zinc-600">
            <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
            <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-fuchsia-200/90 bg-white px-2.5 py-1 font-medium text-fuchsia-900 shadow-sm hover:bg-fuchsia-50/80 disabled:opacity-50"
            >
                {busy ? 'Uploading…' : 'Attach file to this run'}
            </button>
            {progress ? <span className="text-fuchsia-800">{progress}</span> : null}
            <span className="text-zinc-500">Proxied to Shell Engine (container path for OpenCode).</span>
        </div>
    );
}

function Am4OpencodeSessionBanner({ sessionId }: { sessionId: string }) {
    const sid = sessionId.trim();
    if (!sid) {
        return null;
    }
    return (
        <div className="rounded-lg border border-violet-200/80 bg-violet-50/50 px-2.5 py-2 text-[11px] text-violet-950">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold uppercase tracking-wide text-violet-900">OpenCode session</span>
                <button
                    type="button"
                    title="Copy session id"
                    onClick={() => {
                        void navigator.clipboard.writeText(sid).then(
                            () => toast.success('Session id copied'),
                            () => toast.error('Could not copy'),
                        );
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-violet-300/80 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-violet-900 hover:bg-violet-50"
                >
                    <LucideCopy className="h-3.5 w-3.5" aria-hidden />
                    Copy
                </button>
            </div>
            <code className="mt-1.5 block break-all rounded border border-violet-200/60 bg-white/80 px-2 py-1.5 font-mono text-[10px] leading-snug text-zinc-800">
                {sid}
            </code>
        </div>
    );
}

const bubbleClass =
    'border border-zinc-200/90 bg-white/95 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.03] backdrop-blur-sm';

export default function ComponentAnswerMachineV4StreamGroup({
    items,
    onManualRefresh,
    threadId,
}: {
    items: tsMessageItem[];
    onManualRefresh?: () => void;
    threadId?: string;
}) {
    const [expanded, setExpanded] = useState(false);

    if (items.length === 0) {
        return null;
    }

    const livePipeline = useMemo(() => {
        for (const m of items) {
            const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
            if (!sp) {
                continue;
            }
            if (sp.kind === 'iteration' && sp.status === 'in_progress') {
                return true;
            }
            if (sp.kind === 'sub_question' && sp.status === 'pending') {
                return true;
            }
        }
        return false;
    }, [items]);

    const opencodeSessionId = useMemo(() => {
        for (const m of items) {
            const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
            if (sp?.kind === 'iteration' && typeof sp.opencodeSessionId === 'string' && sp.opencodeSessionId.trim()) {
                return sp.opencodeSessionId.trim();
            }
        }
        return '';
    }, [items]);

    const first = items[0];
    const anchorId = first._id;
    const grouped = useMemo(() => groupAnswerMachineV4PipelineItems(items), [items]);
    const iterationCount = grouped.filter((b) => b.type === 'iteration_block').length;

    return (
        <div className="flex w-full min-w-0 justify-start py-1.5" id={`key-message-${anchorId}`}>
            <div
                id={`message-id-${anchorId}`}
                className={`w-full max-w-[min(100%,42rem)] rounded-2xl rounded-tl-md px-3.5 py-3 sm:px-4 ${bubbleClass}`}
            >
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((e) => !e)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg text-left outline-none ring-fuchsia-600/0 transition-colors hover:bg-fuchsia-50/40 focus-visible:ring-2 focus-visible:ring-fuchsia-600/30"
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[12px] font-semibold tracking-tight text-fuchsia-900">
                                Answer Machine 4 · OpenCode pipeline
                            </span>
                            <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-medium text-fuchsia-900">
                                {iterationCount > 0
                                    ? `${iterationCount} ${iterationCount === 1 ? 'iteration' : 'iterations'}`
                                    : `${items.length} steps`}
                            </span>
                            {livePipeline ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                                    In progress · ~10s refresh
                                </span>
                            ) : null}
                        </div>
                        {!expanded && (
                            <p className="mt-1 text-[11px] text-zinc-500">Collapsed — tap to show steps</p>
                        )}
                    </div>
                    <span className="mt-0.5 shrink-0 text-fuchsia-800">
                        {expanded ? (
                            <LucideChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden />
                        ) : (
                            <LucideChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                        )}
                    </span>
                </button>

                {expanded ? (
                    <>
                        {livePipeline && onManualRefresh ? (
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-amber-50/55 px-2.5 py-2 text-[11px] text-amber-950">
                                <span>
                                    A reasoning step is running (OpenCode or verifier). Updates merge into chat about
                                    every 10 seconds.
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onManualRefresh();
                                    }}
                                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300/80 bg-white/90 px-2 py-1 text-[11px] font-medium text-amber-900 shadow-sm hover:bg-amber-50"
                                >
                                    <LucideRefreshCw className="h-3.5 w-3.5" aria-hidden />
                                    Refresh now
                                </button>
                            </div>
                        ) : null}
                        {threadId ? (
                            <AnswerMachineV4AttachFileBar
                                threadId={threadId}
                                items={items}
                                onUploaded={onManualRefresh}
                            />
                        ) : null}
                        <div className="mt-2 border-t border-fuchsia-200/50 pt-2">
                            <div className="space-y-3">
                                <Am4OpencodeSessionBanner sessionId={opencodeSessionId} />
                                {grouped.map((block) => {
                                    if (block.type === 'iteration_block' && threadId) {
                                        return (
                                            <AnswerMachineV4IterationCollapsible
                                                key={block.iteration._id}
                                                iteration={block.iteration}
                                                subQuestions={block.subQuestions}
                                                iterationFiles={block.iterationFiles}
                                                subQuestionFiles={block.subQuestionFiles}
                                                onManualRefresh={onManualRefresh}
                                                threadId={threadId}
                                            />
                                        );
                                    }
                                    if (block.type === 'iteration_block') {
                                        return null;
                                    }
                                    if (block.type === 'final_answer' && threadId) {
                                        return (
                                            <AnswerMachineV4FinalAnswerRow
                                                key={block.item._id}
                                                item={block.item}
                                                attachments={block.attachments}
                                                threadId={threadId}
                                            />
                                        );
                                    }
                                    if (block.type === 'final_answer') {
                                        return null;
                                    }
                                    if (block.type === 'orphan_files') {
                                        return threadId ? (
                                            <div
                                                key={`orphan-am4-files-${block.items[0]?._id ?? 'none'}`}
                                                className="rounded-xl border border-sky-200/70 bg-sky-50/40 p-3"
                                            >
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
                                                    Answer Machine 4 files (unattached in this view)
                                                </p>
                                                <AnswerMachineV4FileArtifacts threadId={threadId} items={block.items} />
                                            </div>
                                        ) : null;
                                    }
                                    return threadId ? (
                                        <div
                                            key={block.item._id}
                                            className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-3"
                                        >
                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                                                Unattached sub-question
                                            </p>
                                            <AnswerMachineV4SubQuestionCollapsible item={block.item} threadId={threadId} />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <div className="mt-2 border-t border-zinc-200/50 pt-2">
                            <p className="text-[11px] leading-snug text-zinc-500">
                                OpenCode-only reasoning; large files reach the agent via Shell workspace paths.
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
