import { useMemo, useRef, useState } from 'react';
import { LucideChevronDown, LucideChevronRight, LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../../config/axiosCustom';
import type { AnswerMachineV3StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import AnswerMachineV3FileArtifacts from './AnswerMachineV3FileArtifacts';
import {
    AnswerMachineV3FinalAnswerRow,
    AnswerMachineV3IterationCollapsible,
    AnswerMachineV3SubQuestionCollapsible,
} from './AnswerMachineV3StreamStep';
import { groupAnswerMachineV3PipelineItems } from './groupAnswerMachineV3PipelineItems';

function inferAm3UploadTarget(items: tsMessageItem[]): { requestId: string; iteration: number } | null {
    let requestId: string | null = null;
    let maxIter = 0;
    for (const m of items) {
        const sp = m.streamPayload as AnswerMachineV3StreamPayload | undefined;
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

function AnswerMachineV3AttachFileBar({
    threadId,
    items,
    onUploaded,
}: {
    threadId: string;
    items: tsMessageItem[];
    onUploaded?: () => void;
}) {
    const target = useMemo(() => inferAm3UploadTarget(items), [items]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    if (!target) {
        return null;
    }

    const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('threadId', threadId);
            fd.append('answerMachineRequestV3Id', target.requestId);
            fd.append('answerMachineIteration', String(target.iteration));
            await axiosCustom.post('/api/chat-llm/crud/answerMachineFileV3Upload', fd);
            toast.success('File attached. Refreshing chat…');
            onUploaded?.();
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="not-prose mt-2 flex flex-wrap items-center gap-2 border-t border-teal-100/80 pt-2 text-[11px] text-zinc-600">
            <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
            <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-teal-200/90 bg-white px-2.5 py-1 font-medium text-teal-800 shadow-sm hover:bg-teal-50/80 disabled:opacity-50"
            >
                {busy ? 'Uploading…' : 'Attach file to this run'}
            </button>
            <span className="text-zinc-500">Stored in Answer Machine Files V3 (shown after refresh).</span>
        </div>
    );
}

const bubbleClass =
    'border border-zinc-200/90 bg-white/95 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.03] backdrop-blur-sm';

/** One assistant bubble containing all consecutive Answer Machine 3 pipeline steps. */
export default function ComponentAnswerMachineV3StreamGroup({
    items,
    onManualRefresh,
    threadId,
}: {
    items: tsMessageItem[];
    /** Refetch chat messages (reloads merged AM3 stream from the server). */
    onManualRefresh?: () => void;
    /** Current thread — enables “Attach file to this run” → `answerMachineFilesV3`. */
    threadId?: string;
}) {
    const [expanded, setExpanded] = useState(false);

    if (items.length === 0) {
        return null;
    }

    const livePipeline = useMemo(() => {
        for (const m of items) {
            const sp = m.streamPayload as AnswerMachineV3StreamPayload | undefined;
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

    const first = items[0];
    const anchorId = first._id;
    const grouped = useMemo(() => groupAnswerMachineV3PipelineItems(items), [items]);
    const iterationCount = grouped.filter((b) => b.type === 'iteration_block').length;

    return (
        <div
            className="flex w-full min-w-0 justify-start py-1.5"
            id={`key-message-${anchorId}`}
        >
            <div
                id={`message-id-${anchorId}`}
                className={`w-full max-w-[min(100%,42rem)] rounded-2xl rounded-tl-md px-3.5 py-3 sm:px-4 ${bubbleClass}`}
            >
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((e) => !e)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg text-left outline-none ring-teal-600/0 transition-colors hover:bg-teal-50/40 focus-visible:ring-2 focus-visible:ring-teal-600/30"
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[12px] font-semibold tracking-tight text-teal-900">
                                Answer Machine 3 · Pipeline
                            </span>
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-800">
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
                            <p className="mt-1 text-[11px] text-zinc-500">
                                Collapsed — tap to show steps
                            </p>
                        )}
                    </div>
                    <span className="mt-0.5 shrink-0 text-teal-700">
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
                                    A reasoning step is running (shell, LLM, or verify). Updates merge into chat about
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
                            <AnswerMachineV3AttachFileBar
                                threadId={threadId}
                                items={items}
                                onUploaded={onManualRefresh}
                            />
                        ) : null}
                        <div className="mt-2 border-t border-teal-200/50 pt-2">
                            <div className="space-y-3">
                                {grouped.map((block) => {
                                    if (block.type === 'iteration_block') {
                                        return (
                                            <AnswerMachineV3IterationCollapsible
                                                key={block.iteration._id}
                                                iteration={block.iteration}
                                                subQuestions={block.subQuestions}
                                                iterationFiles={block.iterationFiles}
                                                subQuestionFiles={block.subQuestionFiles}
                                                onManualRefresh={onManualRefresh}
                                            />
                                        );
                                    }
                                    if (block.type === 'final_answer') {
                                        return (
                                            <AnswerMachineV3FinalAnswerRow
                                                key={block.item._id}
                                                item={block.item}
                                                attachments={block.attachments}
                                            />
                                        );
                                    }
                                    if (block.type === 'orphan_files') {
                                        return (
                                            <div
                                                key={`orphan-am3-files-${block.items[0]?._id ?? 'none'}`}
                                                className="rounded-xl border border-sky-200/70 bg-sky-50/40 p-3"
                                            >
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
                                                    Answer Machine files (unattached in this view)
                                                </p>
                                                <AnswerMachineV3FileArtifacts items={block.items} />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            key={block.item._id}
                                            className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-3"
                                        >
                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                                                Unattached sub-question
                                            </p>
                                            <AnswerMachineV3SubQuestionCollapsible item={block.item} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-2 border-t border-zinc-200/50 pt-2">
                            <p className="text-[11px] leading-snug text-zinc-500">
                                Behind-the-scenes work while Answer Machine 3 composed your answer.
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
