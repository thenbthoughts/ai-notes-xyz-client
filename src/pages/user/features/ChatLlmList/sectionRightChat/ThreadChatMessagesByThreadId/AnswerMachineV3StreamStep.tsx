import { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import { LucideChevronDown, LucideChevronRight, LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../../../../../../components/markdown/MarkdownRenderer';
import type { AnswerMachineV3StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import { downloadStoredUserFile, fetchAuthenticatedFileBlob } from '../../../../../../utils/authenticatedGetFile';
import AnswerMachineV3FileArtifacts from './AnswerMachineV3FileArtifacts';

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

function PipelineIterationImageSlot({ label, storedKey }: { label: string; storedKey: string }) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const urlRef = useRef<string | null>(null);
    const [loading, setLoading] = useState(!!storedKey);
    const [dlBusy, setDlBusy] = useState(false);

    useEffect(() => {
        if (!storedKey) {
            setBlobUrl(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }
        setLoading(true);
        setBlobUrl(null);
        fetchAuthenticatedFileBlob(storedKey, { inline: true })
            .then((blob) => {
                if (cancelled) {
                    return;
                }
                const u = URL.createObjectURL(blob);
                urlRef.current = u;
                setBlobUrl(u);
            })
            .catch(() => {
                if (!cancelled) {
                    toast.error(`Could not load ${label} image`);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }
        };
    }, [storedKey, label]);

    const fileLabel = storedKey.split('/').pop() || `${label.toLowerCase()}.png`;

    const onSave = () => {
        setDlBusy(true);
        downloadStoredUserFile(storedKey, fileLabel)
            .catch(() => toast.error('Download failed'))
            .finally(() => setDlBusy(false));
    };

    return (
        <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
                {storedKey ? (
                    <button
                        type="button"
                        disabled={dlBusy}
                        onClick={onSave}
                        className="shrink-0 text-[10px] font-medium text-teal-700 hover:underline disabled:opacity-50"
                    >
                        {dlBusy ? '…' : 'Save'}
                    </button>
                ) : null}
            </div>
            {!storedKey ? (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-zinc-200/90 bg-zinc-50/80 px-2 text-center text-[10px] text-zinc-400">
                    No image yet
                </div>
            ) : loading ? (
                <div className="flex h-20 items-center justify-center rounded-lg border border-zinc-200/70 bg-zinc-50/60 text-[10px] text-zinc-500">
                    Loading…
                </div>
            ) : blobUrl ? (
                <button
                    type="button"
                    className="block w-full outline-none ring-indigo-500/0 focus-visible:ring-2 focus-visible:ring-indigo-500/35"
                    onClick={() => window.open(blobUrl, '_blank', 'noopener,noreferrer')}
                >
                    <img
                        src={blobUrl}
                        alt={`${label} preview`}
                        className="max-h-28 w-full rounded-lg border border-zinc-200/80 bg-zinc-50 object-contain"
                        loading="lazy"
                    />
                </button>
            ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-zinc-200/70 bg-zinc-50/60 px-2 text-center text-[10px] text-zinc-500">
                    Unavailable
                </div>
            )}
        </div>
    );
}

function AnswerMachineV3IterationPipelineImages({
    payload,
}: {
    payload: Extract<AnswerMachineV3StreamPayload, { kind: 'iteration' }>;
}) {
    if (payload.inputImageStoredFileUrl === undefined && payload.outputImageStoredFileUrl === undefined) {
        return null;
    }
    const inUrl = (payload.inputImageStoredFileUrl ?? '').trim();
    const outUrl = (payload.outputImageStoredFileUrl ?? '').trim();
    return (
        <div className="mt-2 flex gap-3 rounded-lg border border-zinc-200/55 bg-zinc-50/40 px-2 py-2 sm:px-3">
            <PipelineIterationImageSlot label="Input" storedKey={inUrl} />
            <PipelineIterationImageSlot label="Output" storedKey={outUrl} />
        </div>
    );
}

export function AnswerMachineV3PriorIterationCallout({
    payload,
}: {
    payload: Extract<AnswerMachineV3StreamPayload, { kind: 'iteration' }>;
}) {
    const [draftOpen, setDraftOpen] = useState(false);
    if (payload.iterationNumber < 2) {
        return null;
    }
    const reason = (payload.priorIterationEvaluationReason ?? '').trim();
    const excerpt = (payload.priorIterationDraftExcerpt ?? '').trim();
    if (!reason && !excerpt) {
        return null;
    }

    const sat = payload.priorIterationWasSatisfactory;
    const evalPill =
        typeof sat === 'boolean' ? (
            <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    sat ? 'bg-emerald-100/90 text-emerald-900' : 'bg-amber-100/90 text-amber-900'
                }`}
            >
                {sat ? 'Prior pass: evaluator OK' : 'Prior pass: needs improvement'}
            </span>
        ) : null;

    return (
        <div className="mt-2 rounded-lg border border-violet-200/70 bg-violet-50/50 px-2.5 py-2 sm:px-3">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-900">
                    From previous iteration
                </p>
                {evalPill}
            </div>
            {reason ? (
                <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-snug text-violet-950/90">{reason}</p>
            ) : null}
            {excerpt ? (
                <div className="mt-2 border-t border-violet-200/50 pt-2">
                    <button
                        type="button"
                        aria-expanded={draftOpen}
                        onClick={() => setDraftOpen((v) => !v)}
                        className="flex w-full items-center justify-between gap-2 rounded-md text-left text-[10px] font-medium text-violet-800 hover:bg-violet-100/40"
                    >
                        <span>Prior draft excerpt</span>
                        {draftOpen ? (
                            <LucideChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : (
                            <LucideChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        )}
                    </button>
                    {draftOpen ? (
                        <div className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-violet-200/60 bg-white/80 p-2 text-[11px] leading-snug text-zinc-800">
                            {excerpt}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
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

/** Iteration header only (nested inside an iteration card). */
export function AnswerMachineV3IterationHeader({ item }: { item: tsMessageItem }) {
    const sp = item.streamPayload as AnswerMachineV3StreamPayload | undefined;
    if (!sp || sp.kind !== 'iteration') {
        return (
            <div>
                <p className="text-sm text-zinc-600">Answer Machine 3 · Iteration</p>
                {renderStepDate(item)}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                    Answer Machine 3 · Iteration {sp.iterationNumber}
                </span>
                {statusPill(sp.status)}
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
                <p className="mt-1 text-[10px] text-zinc-600">
                    <span className="font-semibold text-zinc-500">Global task: </span>
                    {(sp.globalTaskDescriptionExcerpt ?? '').trim()}
                </p>
            ) : null}
            {sp.errorReason ? (
                <div className="mt-2 rounded-lg border border-red-200/70 bg-red-50/60 p-2 text-xs text-red-900 whitespace-pre-wrap">
                    {sp.errorReason}
                </div>
            ) : null}
            {renderStepDate(item)}
        </div>
    );
}

/** Iteration card with expand/collapse for its sub-questions section. */
export function AnswerMachineV3IterationCollapsible({
    iteration,
    subQuestions,
    iterationFiles,
    subQuestionFiles,
    onManualRefresh,
}: {
    iteration: tsMessageItem;
    subQuestions: tsMessageItem[];
    iterationFiles: tsMessageItem[];
    subQuestionFiles: Record<string, tsMessageItem[]>;
    onManualRefresh?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const sp = iteration.streamPayload as AnswerMachineV3StreamPayload | undefined;

    if (!sp || sp.kind !== 'iteration') {
        return (
            <div className="rounded-xl border border-zinc-200/75 bg-white/55 p-3 shadow-sm shadow-zinc-900/[0.03]">
                <p className="text-sm text-zinc-600">Answer Machine 3 · Iteration</p>
                {renderStepDate(iteration)}
            </div>
        );
    }

    const subLabel =
        subQuestions.length === 0
            ? null
            : `${subQuestions.length} reasoning step${subQuestions.length === 1 ? '' : 's'}`;

    const scopedSubFileCount = Object.values(subQuestionFiles).reduce((acc, rows) => acc + rows.length, 0);
    const fileBadgeTotal = iterationFiles.length + scopedSubFileCount;
    const fileBadge =
        fileBadgeTotal > 0 ? `${fileBadgeTotal} file${fileBadgeTotal === 1 ? '' : 's'}` : null;

    const hasLiveWork =
        sp.status === 'in_progress' ||
        subQuestions.some((sq) => {
            const p = sq.streamPayload;
            return p?.kind === 'sub_question' && p.status === 'pending';
        });

    return (
        <div className="rounded-xl border border-zinc-200/75 bg-white/55 shadow-sm shadow-zinc-900/[0.03]">
            <div className="flex w-full items-start gap-1 rounded-xl px-2 py-1 sm:px-3 sm:py-2.5">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="flex min-w-0 flex-1 items-start justify-between gap-2 rounded-lg text-left outline-none ring-indigo-600/0 transition-colors hover:bg-indigo-50/40 focus-visible:ring-2 focus-visible:ring-indigo-600/25"
                >
                    <span className="mt-0.5 shrink-0 text-indigo-700">
                        {open ? (
                            <LucideChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                        ) : (
                            <LucideChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                        )}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                                Answer Machine 3 · Iteration {sp.iterationNumber}
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
                                {subQuestions.length > 0 ? 'Tap to show reasoning steps' : 'Tap for details'}
                            </p>
                        ) : null}
                    </div>
                </button>
                {hasLiveWork && onManualRefresh ? (
                    <button
                        type="button"
                        aria-label="Refresh Answer Machine steps from server"
                        title="Refresh now"
                        onClick={() => onManualRefresh()}
                        className="mt-0.5 shrink-0 rounded-lg border border-indigo-200/80 bg-white/90 p-1.5 text-indigo-800 shadow-sm hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    >
                        <LucideRefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                ) : null}
            </div>

            <div className="px-2 pb-2 sm:px-3">
                <AnswerMachineV3PriorIterationCallout payload={sp} />
                <AnswerMachineV3IterationPipelineImages payload={sp} />
            </div>

            {open ? (
                <div className="border-t border-zinc-200/50 px-3 pb-3 pt-2">
                    {sp.errorReason ? (
                        <div className="mb-2 rounded-lg border border-red-200/70 bg-red-50/60 p-2 text-xs text-red-900 whitespace-pre-wrap">
                            {sp.errorReason}
                        </div>
                    ) : null}
                    {renderStepDate(iteration)}
                    {iterationFiles.length > 0 ? <AnswerMachineV3FileArtifacts items={iterationFiles} /> : null}
                    {subQuestions.length > 0 ? (
                        <div className="mt-2 border-t border-zinc-200/50 pt-2">
                            <div className="divide-y divide-zinc-200/50">
                                {subQuestions.map((sq) => {
                                    const sid = String(sq._id).startsWith('am3-sq-')
                                        ? String(sq._id).slice('am3-sq-'.length)
                                        : String(sq._id);
                                    const scoped = subQuestionFiles[sid] ?? [];
                                    return (
                                        <AnswerMachineV3SubQuestionCollapsible
                                            key={sq._id}
                                            item={sq}
                                            relatedFiles={scoped}
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

/** Sub-question with expand/collapse for full Q&amp;A. */
export function AnswerMachineV3SubQuestionCollapsible({
    item,
    relatedFiles = [],
}: {
    item: tsMessageItem;
    relatedFiles?: tsMessageItem[];
}) {
    const [open, setOpen] = useState(false);
    const sp = item.streamPayload as AnswerMachineV3StreamPayload | undefined;

    if (!sp || sp.kind !== 'sub_question') {
        return (
            <div className="py-2">
                <p className="text-sm text-zinc-600">Answer Machine 3 · Sub-question</p>
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
                className="flex w-full items-start justify-between gap-2 rounded-lg py-1 text-left outline-none ring-teal-600/0 transition-colors hover:bg-teal-50/50 focus-visible:ring-2 focus-visible:ring-teal-600/25"
            >
                <span className="mt-0.5 shrink-0 text-teal-800">
                    {open ? (
                        <LucideChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                    ) : (
                        <LucideChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                            {typeof sp.stepIndex === 'number' ? `Step ${sp.stepIndex}` : 'Sub-question'}
                            {typeof sp.attemptNumber === 'number' && sp.attemptNumber > 1
                                ? ` · attempt ${sp.attemptNumber}`
                                : ''}
                        </span>
                        {sp.subKind ? (
                            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">
                                {sp.subKind}
                            </span>
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
                    <AnswerMachineV3SubQuestionBody item={item} hideMetaRow className="py-0" />
                    {relatedFiles.length > 0 ? <AnswerMachineV3FileArtifacts items={relatedFiles} /> : null}
                </div>
            ) : null}
        </div>
    );
}

/** One sub-question block (nested under its iteration). */
export function AnswerMachineV3SubQuestionBody({
    item,
    hideMetaRow,
    className,
}: {
    item: tsMessageItem;
    /** When true, skip the title row (used inside {@link AnswerMachineV3SubQuestionCollapsible}). */
    hideMetaRow?: boolean;
    className?: string;
}) {
    const sp = item.streamPayload as AnswerMachineV3StreamPayload | undefined;
    if (!sp || sp.kind !== 'sub_question') {
        return (
            <div className="py-2">
                <p className="text-sm text-zinc-600">Answer Machine 3 · Sub-question</p>
                {renderStepDate(item)}
            </div>
        );
    }

    return (
        <div className={`py-2 first:pt-0 last:pb-0${className ? ` ${className}` : ''}`}>
            {!hideMetaRow ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                        Answer Machine 3 · Sub-question
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
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Answer</p>
                    <div className="whitespace-pre-wrap rounded-lg border border-teal-200/60 bg-teal-50/40 p-2 text-xs text-zinc-800">
                        {sp.answer}
                    </div>
                </div>
            ) : null}
            {sp.executedShellCommand ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">Executed shell command</p>
                    <div className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-amber-200/70 bg-amber-50/50 p-2 font-mono text-[11px] text-zinc-800">
                        {sp.executedShellCommand}
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">
                        {typeof sp.shellExecutionSuccess === 'boolean'
                            ? sp.shellExecutionSuccess
                                ? 'Run succeeded.'
                                : 'Run did not succeed.'
                            : null}
                        {typeof sp.shellExecutionExitCode === 'number' ? ` Exit code ${sp.shellExecutionExitCode}.` : ''}
                        {sp.shellExecutionTimedOut ? ' Timed out.' : ''}
                    </p>
                    {sp.shellExecutionStderrPreview ? (
                        <div className="mt-1">
                            <p className="mb-0.5 text-[10px] font-semibold text-zinc-500">Stderr (preview)</p>
                            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-rose-200/60 bg-rose-50/40 p-2 font-mono text-[10px] text-zinc-800">
                                {sp.shellExecutionStderrPreview}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
            {sp.shellRetryGuidance ? (
                <div className="mt-2">
                    <p className="mb-1 text-[11px] font-semibold text-zinc-500">How to improve the next command</p>
                    <div className="whitespace-pre-wrap rounded-lg border border-sky-200/60 bg-sky-50/40 p-2 text-xs text-zinc-800">
                        {sp.shellRetryGuidance}
                    </div>
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

/** Request-level final answer (markdown). */
export function AnswerMachineV3FinalAnswerRow({
    item,
    attachments = [],
}: {
    item: tsMessageItem;
    attachments?: tsMessageItem[];
}) {
    const sp = item.streamPayload as AnswerMachineV3StreamPayload | undefined;
    const text =
        sp?.kind === 'final_answer' ? sp.answerText : (item.content || '').trim() || '(No final answer text.)';

    return (
        <div className="rounded-xl border border-violet-200/70 bg-violet-50/35 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-900">
                    Answer Machine 3 · Final answer
                </span>
            </div>
            <div className="am3-final-answer-md mt-2 text-xs text-zinc-800 [&_pre]:overflow-x-auto">
                <MarkdownRenderer content={text} />
            </div>
            {attachments.length > 0 ? <AnswerMachineV3FileArtifacts items={attachments} /> : null}
            {renderStepDate(item)}
        </div>
    );
}

/** Single flat row (legacy / fallback when not using grouped layout). */
export function AnswerMachineV3StreamStep({ item }: { item: tsMessageItem }) {
    const sp = item.streamPayload as AnswerMachineV3StreamPayload | undefined;
    if (!sp) {
        return (
            <div className="py-2">
                <p className="text-sm text-zinc-600">Answer Machine 3 event</p>
                {renderStepDate(item)}
            </div>
        );
    }

    if (sp.kind === 'iteration') {
        return (
            <div className="py-2">
                <AnswerMachineV3IterationCollapsible
                    iteration={item}
                    subQuestions={[]}
                    iterationFiles={[]}
                    subQuestionFiles={{}}
                />
            </div>
        );
    }

    if (sp.kind === 'final_answer') {
        return (
            <div className="py-2">
                <AnswerMachineV3FinalAnswerRow item={item} attachments={[]} />
            </div>
        );
    }

    if (sp.kind === 'file_artifact') {
        return (
            <div className="py-2">
                <AnswerMachineV3FileArtifacts items={[item]} />
            </div>
        );
    }

    return (
        <div className="py-2">
            <AnswerMachineV3SubQuestionCollapsible item={item} />
        </div>
    );
}
