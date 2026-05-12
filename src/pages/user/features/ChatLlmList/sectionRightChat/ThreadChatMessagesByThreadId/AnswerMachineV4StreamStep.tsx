import { useState } from 'react';
import { DateTime } from 'luxon';
import { LucideChevronDown, LucideChevronRight, LucideDownload, LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../../../../../../components/markdown/MarkdownRenderer';
import type { AnswerMachineV4StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import axiosCustom from '../../../../../../config/axiosCustom';
import AnswerMachineStoredFileArtifacts, {
    AnswerMachineIterationPriorIterationCallout,
    type AnswerMachineIterationPriorPayload,
} from './answerMachineStreamShared';
import { downloadStoredUserFile } from '../../../../../../utils/authenticatedGetFile';

function statusPill(s: string) {
    const map: Record<string, string> = {
        answered: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        skipped: 'bg-gray-100 text-gray-700',
        in_progress: 'bg-amber-100 text-amber-800',
        completed: 'bg-green-100 text-green-700',
    };
    const cls = map[s] ?? 'bg-zinc-100 text-zinc-700';
    return <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${cls}`}>{s}</span>;
}

function truncatePreview(s: string, max: number) {
    const t = s.replace(/\s+/g, ' ').trim();
    if (!t) {
        return '';
    }
    return t.length <= max ? t : `${t.slice(0, Math.max(0, max - 1))}…`;
}

function renderStepDate(item: tsMessageItem) {
    const u = item.updatedAtUtc;
    return (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
            <span>{new Date(u).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>{new Date(u).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{DateTime.fromJSDate(new Date(u)).toRelative()}</span>
        </div>
    );
}

function Am4AttachedFilesSection({
    threadId,
    files,
}: {
    threadId: string;
    files: NonNullable<Extract<AnswerMachineV4StreamPayload, { kind: 'iteration' }>['attachedFiles']>;
}) {
    const [busyId, setBusyId] = useState<string | null>(null);

    if (!files.length) {
        return null;
    }

    const downloadShell = async (fileDocId: string, label: string) => {
        setBusyId(fileDocId);
        try {
            const res = await axiosCustom.post(
                '/api/chat-llm/crud/answerMachineFileV4Download',
                { fileDocId, threadId },
                { responseType: 'blob' },
            );
            const blob = res.data as Blob;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = label || 'download';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Download started');
        } catch {
            toast.error('Download failed');
        } finally {
            setBusyId(null);
        }
    };

    const downloadStored = async (storedKey: string, label: string) => {
        try {
            await downloadStoredUserFile(storedKey, label);
        } catch {
            toast.error('Download failed');
        }
    };

    return (
        <div className="mt-2 rounded-lg border border-fuchsia-200/70 bg-fuchsia-50/40 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-900">Attached files (workspace)</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f) => (
                    <div
                        key={f.fileDocId}
                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-fuchsia-200/90 bg-white/90 px-2.5 py-1 text-[10px] text-fuchsia-950"
                    >
                        <span className="truncate font-medium" title={f.containerPath}>
                            {f.fileName}
                        </span>
                        <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] ${
                                f.uploadStatus === 'saved_to_shell' ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100 text-zinc-700'
                            }`}
                        >
                            {f.uploadStatus === 'saved_to_shell' ? 'mounted' : f.uploadStatus}
                        </span>
                        {(f.storedFileUrl || '').trim() ? (
                            <button
                                type="button"
                                className="ml-0.5 inline-flex shrink-0 text-fuchsia-800 hover:text-fuchsia-950"
                                title="Download from storage"
                                onClick={() => void downloadStored((f.storedFileUrl || '').trim(), f.fileName)}
                            >
                                <LucideDownload className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        ) : f.shellRelativePath ? (
                            <button
                                type="button"
                                disabled={busyId === f.fileDocId}
                                className="ml-0.5 inline-flex shrink-0 text-fuchsia-800 hover:text-fuchsia-950 disabled:opacity-50"
                                title="Download via Shell"
                                onClick={() => void downloadShell(f.fileDocId, f.fileName)}
                            >
                                <LucideDownload className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Mixed V3/V4 file rows: prefer stored-file UX; Shell path fallback for AM4. */
export function AnswerMachineV4FileArtifacts({ items, threadId }: { items: tsMessageItem[]; threadId: string }) {
    const v3Style: tsMessageItem[] = [];
    const shellOnly: tsMessageItem[] = [];
    for (const row of items) {
        const sp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp || sp.kind !== 'file_artifact') {
            continue;
        }
        if ((sp.storedFileUrl || '').trim()) {
            v3Style.push(row);
        } else if ((sp.shellRelativePath || '').trim() && sp.fileDocId) {
            shellOnly.push(row);
        }
    }

    return (
        <div className="mt-3 space-y-3 border-t border-zinc-200/60 pt-3">
            {v3Style.length > 0 ? <AnswerMachineStoredFileArtifacts items={v3Style} /> : null}
            {shellOnly.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Shell workspace files</p>
                    {shellOnly.map((row, i) => {
                        const sp = row.streamPayload as Extract<AnswerMachineV4StreamPayload, { kind: 'file_artifact' }>;
                        return (
                            <div key={`${sp.fileDocId}-${i}`} className="rounded-lg border border-zinc-200/80 bg-zinc-50/60 px-2 py-2 text-[11px]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium text-zinc-800">{sp.originalName}</span>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-md border border-fuchsia-200 bg-white px-2 py-0.5 text-[10px] font-medium text-fuchsia-900 hover:bg-fuchsia-50"
                                        onClick={async () => {
                                            try {
                                                const res = await axiosCustom.post(
                                                    '/api/chat-llm/crud/answerMachineFileV4Download',
                                                    { fileDocId: sp.fileDocId, threadId },
                                                    { responseType: 'blob' },
                                                );
                                                const blob = res.data as Blob;
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = sp.originalName || 'file';
                                                a.click();
                                                URL.revokeObjectURL(url);
                                                toast.success('Download started');
                                            } catch {
                                                toast.error('Download failed');
                                            }
                                        }}
                                    >
                                        <LucideDownload className="h-3.5 w-3.5" aria-hidden />
                                        Download
                                    </button>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-zinc-500" title={sp.containerPath}>
                                    {sp.containerPath || sp.shellRelativePath}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

export function AnswerMachineV4IterationCollapsible({
    iteration,
    subQuestions,
    iterationFiles,
    subQuestionFiles,
    onManualRefresh,
    threadId,
}: {
    iteration: tsMessageItem;
    subQuestions: tsMessageItem[];
    iterationFiles: tsMessageItem[];
    subQuestionFiles: Record<string, tsMessageItem[]>;
    onManualRefresh?: () => void;
    threadId: string;
}) {
    const [open, setOpen] = useState(false);
    const sp = iteration.streamPayload as AnswerMachineV4StreamPayload | undefined;

    if (!sp || sp.kind !== 'iteration') {
        return (
            <div className="rounded-xl border border-zinc-200/75 bg-white/55 p-3 shadow-sm shadow-zinc-900/[0.03]">
                <p className="text-sm text-zinc-600">Answer Machine 4 · Iteration</p>
                {renderStepDate(iteration)}
            </div>
        );
    }

    const priorPayload = sp as AnswerMachineIterationPriorPayload;

    const subLabel =
        subQuestions.length === 0
            ? null
            : `${subQuestions.length} reasoning step${subQuestions.length === 1 ? '' : 's'}`;

    const scopedSubFileCount = Object.values(subQuestionFiles).reduce((acc, rows) => acc + rows.length, 0);
    const fileBadgeTotal = (sp.attachedFiles?.length ?? 0) + iterationFiles.length + scopedSubFileCount;
    const fileBadge = fileBadgeTotal > 0 ? `${fileBadgeTotal} file${fileBadgeTotal === 1 ? '' : 's'}` : null;

    const hasLiveWork =
        sp.status === 'in_progress' ||
        subQuestions.some((sq) => {
            const p = sq.streamPayload as AnswerMachineV4StreamPayload | undefined;
            return p?.kind === 'sub_question' && p.status === 'pending';
        });

    return (
        <div className="rounded-xl border border-fuchsia-200/75 bg-white/55 shadow-sm shadow-zinc-900/[0.03]">
            <div className="flex w-full items-start gap-1 rounded-xl px-2 py-1 sm:px-3 sm:py-2.5">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="flex min-w-0 flex-1 items-start justify-between gap-2 rounded-lg text-left outline-none ring-fuchsia-600/0 transition-colors hover:bg-fuchsia-50/40 focus-visible:ring-2 focus-visible:ring-fuchsia-600/25"
                >
                    <span className="mt-0.5 shrink-0 text-fuchsia-800">
                        {open ? (
                            <LucideChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                        ) : (
                            <LucideChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                        )}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-900">
                                Answer Machine 4 · Iteration {sp.iterationNumber}
                            </span>
                            {statusPill(sp.status)}
                            {subLabel ? (
                                <span className="rounded-full bg-zinc-100/90 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                                    {subLabel}
                                </span>
                            ) : null}
                            {fileBadge ? (
                                <span className="rounded-full bg-sky-100/90 px-2 py-0.5 text-[10px] font-medium text-sky-800">
                                    {fileBadge}
                                </span>
                            ) : null}
                        </div>
                        {typeof sp.outerIterationMax === 'number' ? (
                            <p className="mt-1 text-[10px] text-zinc-600">
                                Outer iteration {sp.iterationNumber} of {sp.outerIterationMax}
                                {typeof sp.outerIterationsRemaining === 'number'
                                    ? ` · ${sp.outerIterationsRemaining} more pass${sp.outerIterationsRemaining === 1 ? '' : 'es'} allowed after this one`
                                    : ''}
                            </p>
                        ) : null}
                        {(sp.globalTaskDescriptionExcerpt ?? '').trim() ? (
                            <p
                                className={`mt-1 text-[10px] text-zinc-600 ${open ? '' : 'line-clamp-2'}`}
                                title={(sp.globalTaskDescriptionExcerpt ?? '').trim()}
                            >
                                <span className="font-semibold text-zinc-500">Global task: </span>
                                {(sp.globalTaskDescriptionExcerpt ?? '').trim()}
                            </p>
                        ) : null}
                        {sp.errorReason && !open ? (
                            <div className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-[11px] text-red-800">
                                {sp.errorReason}
                            </div>
                        ) : null}
                        {!open ? (
                            <p className="mt-1 text-[10px] text-zinc-500">
                                {subQuestions.length > 0 ? 'Tap to show OpenCode steps' : 'Tap for details'}
                            </p>
                        ) : null}
                    </div>
                </button>
                {hasLiveWork && onManualRefresh ? (
                    <button
                        type="button"
                        aria-label="Refresh Answer Machine 4 steps"
                        title="Refresh now"
                        onClick={() => onManualRefresh()}
                        className="mt-0.5 shrink-0 rounded-lg border border-fuchsia-200/80 bg-white/90 p-1.5 text-fuchsia-900 shadow-sm hover:bg-fuchsia-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/40"
                    >
                        <LucideRefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                ) : null}
            </div>

            <div className="px-2 pb-2 sm:px-3">
                <AnswerMachineIterationPriorIterationCallout payload={priorPayload} />
                {sp.attachedFiles?.length ? <Am4AttachedFilesSection threadId={threadId} files={sp.attachedFiles} /> : null}
            </div>

            {open ? (
                <div className="border-t border-zinc-200/50 px-3 pb-3 pt-2">
                    {sp.errorReason ? (
                        <div className="mb-2 rounded-lg border border-red-200/70 bg-red-50/60 p-2 text-xs text-red-900 whitespace-pre-wrap">
                            {sp.errorReason}
                        </div>
                    ) : null}
                    {renderStepDate(iteration)}
                    {iterationFiles.length > 0 ? (
                        <AnswerMachineV4FileArtifacts threadId={threadId} items={iterationFiles} />
                    ) : null}
                    {subQuestions.length > 0 ? (
                        <div className="mt-2 border-t border-zinc-200/50 pt-2">
                            <div className="divide-y divide-zinc-200/50">
                                {subQuestions.map((sq) => {
                                    const sid = String(sq._id).startsWith('am4-sq-')
                                        ? String(sq._id).slice('am4-sq-'.length)
                                        : String(sq._id);
                                    const scoped = subQuestionFiles[sid] ?? [];
                                    return (
                                        <AnswerMachineV4SubQuestionCollapsible
                                            key={sq._id}
                                            item={sq}
                                            relatedFiles={scoped}
                                            threadId={threadId}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export function AnswerMachineV4SubQuestionCollapsible({
    item,
    relatedFiles = [],
    threadId,
}: {
    item: tsMessageItem;
    relatedFiles?: tsMessageItem[];
    threadId: string;
}) {
    const [open, setOpen] = useState(false);
    const sp = item.streamPayload as AnswerMachineV4StreamPayload | undefined;

    if (!sp || sp.kind !== 'sub_question') {
        return (
            <div className="py-2">
                <p className="text-sm text-zinc-600">Answer Machine 4 · Sub-question</p>
                {renderStepDate(item)}
            </div>
        );
    }

    const preview = truncatePreview(sp.question || sp.answer || '', 96);

    return (
        <div className="py-2 first:pt-0 last:pb-0">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-2 rounded-lg py-1 text-left outline-none ring-fuchsia-600/0 transition-colors hover:bg-fuchsia-50/50 focus-visible:ring-2 focus-visible:ring-fuchsia-600/25"
            >
                <span className="mt-0.5 shrink-0 text-fuchsia-800">
                    {open ? (
                        <LucideChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                    ) : (
                        <LucideChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-900">
                            {typeof sp.stepIndex === 'number' ? `Step ${sp.stepIndex}` : 'Sub-question'}
                            {typeof sp.attemptNumber === 'number' && sp.attemptNumber > 1
                                ? ` · attempt ${sp.attemptNumber}`
                                : ''}
                        </span>
                        {sp.subKind ? (
                            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">{sp.subKind}</span>
                        ) : null}
                        {statusPill(sp.status)}
                        {sp.verificationVerdict ? (
                            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-800">
                                {sp.verificationVerdict.replace(/_/g, ' ')}
                            </span>
                        ) : null}
                    </div>
                    {!open && preview ? (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-600">{preview}</p>
                    ) : null}
                    {!open ? (
                        <p className="mt-1 text-[10px] text-zinc-500">Tap for full question and answer</p>
                    ) : null}
                </div>
            </button>

            {open ? (
                <div className="mt-2 pl-6">
                    <AnswerMachineV4SubQuestionBody item={item} hideMetaRow className="py-0" />
                    {relatedFiles.length > 0 ? (
                        <AnswerMachineV4FileArtifacts threadId={threadId} items={relatedFiles} />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export function AnswerMachineV4SubQuestionBody({
    item,
    hideMetaRow,
    className,
}: {
    item: tsMessageItem;
    hideMetaRow?: boolean;
    className?: string;
}) {
    const sp = item.streamPayload as AnswerMachineV4StreamPayload | undefined;
    if (!sp || sp.kind !== 'sub_question') {
        return (
            <div className="py-2">
                <p className="text-sm text-zinc-600">Answer Machine 4 · Sub-question</p>
                {renderStepDate(item)}
            </div>
        );
    }

    return (
        <div className={`py-2 first:pt-0 last:pb-0${className ? ` ${className}` : ''}`}>
            {!hideMetaRow ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-900">
                        Answer Machine 4 · Sub-question
                    </span>
                    {sp.subKind ? (
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">{sp.subKind}</span>
                    ) : null}
                    {statusPill(sp.status)}
                </div>
            ) : null}
            {sp.question ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Question</p>
                    <div className="whitespace-pre-wrap rounded-lg border border-zinc-200/80 bg-white/80 p-2 text-xs text-zinc-800">
                        {sp.question}
                    </div>
                </div>
            ) : null}
            {sp.answer ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Answer (OpenCode)</p>
                    <div className="whitespace-pre-wrap rounded-lg border border-fuchsia-200/60 bg-fuchsia-50/40 p-2 text-xs text-zinc-800">
                        {sp.answer}
                    </div>
                </div>
            ) : null}
            {sp.contextFilesUsed && sp.contextFilesUsed.length > 0 ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Context files used</p>
                    <ul className="list-inside list-disc space-y-0.5 text-[10px] text-zinc-700">
                        {sp.contextFilesUsed.map((p) => (
                            <li key={p} className="break-all font-mono">
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
            {sp.verificationReason ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Verification</p>
                    <div className="whitespace-pre-wrap rounded-lg border border-indigo-200/60 bg-indigo-50/40 p-2 text-xs text-zinc-800">
                        {sp.verificationVerdict ? `${sp.verificationVerdict}: ` : ''}
                        {sp.verificationReason}
                    </div>
                </div>
            ) : null}
            {typeof sp.verificationAllImpliedSubtasksDone === 'boolean' ||
            typeof sp.verificationFinalAnswerDeliverable === 'boolean' ||
            (sp.verificationGlobalTaskChecklist ?? '').trim() ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Global task checkpoint</p>
                    <div className="flex flex-wrap gap-1.5">
                        {typeof sp.verificationAllImpliedSubtasksDone === 'boolean' ? (
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    sp.verificationAllImpliedSubtasksDone
                                        ? 'bg-emerald-100/90 text-emerald-900'
                                        : 'bg-amber-100/90 text-amber-900'
                                }`}
                            >
                                {sp.verificationAllImpliedSubtasksDone
                                    ? 'All implied subtasks satisfied'
                                    : 'Some implied subtasks not done'}
                            </span>
                        ) : null}
                        {typeof sp.verificationFinalAnswerDeliverable === 'boolean' ? (
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    sp.verificationFinalAnswerDeliverable
                                        ? 'bg-sky-100/90 text-sky-900'
                                        : 'bg-zinc-100/90 text-zinc-700'
                                }`}
                            >
                                {sp.verificationFinalAnswerDeliverable
                                    ? 'Final answer can be delivered now'
                                    : 'Final answer not ready yet'}
                            </span>
                        ) : null}
                    </div>
                    {(sp.verificationGlobalTaskChecklist ?? '').trim() ? (
                        <div className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200/80 bg-white/90 p-2 text-[11px] leading-snug text-zinc-800">
                            {sp.verificationGlobalTaskChecklist}
                        </div>
                    ) : null}
                </div>
            ) : null}
            {renderStepDate(item)}
        </div>
    );
}

export function AnswerMachineV4FinalAnswerRow({
    item,
    attachments = [],
    threadId,
}: {
    item: tsMessageItem;
    attachments?: tsMessageItem[];
    threadId: string;
}) {
    const sp = item.streamPayload;
    const text =
        sp?.kind === 'final_answer' ? sp.answerText : (item.content || '').trim() || '(No final answer text.)';

    return (
        <div className="rounded-xl border border-violet-200/70 bg-violet-50/35 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-900">
                    Answer Machine 4 · Final answer
                </span>
            </div>
            <div className="am4-final-answer-md mt-2 text-xs text-zinc-800 [&_pre]:overflow-x-auto">
                <MarkdownRenderer content={text} />
            </div>
            {attachments.length > 0 ? <AnswerMachineV4FileArtifacts threadId={threadId} items={attachments} /> : null}
            {renderStepDate(item)}
        </div>
    );
}
