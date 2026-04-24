import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    LucideLoader2,
    LucideCheckCircle2,
    LucideXCircle,
    LucideBrain,
    LucideChevronDown,
    LucideChevronUp,
    LucideHelpCircle,
    LucideRefreshCw,
    LucideCoins,
    LucideTerminal,
    LucideFile,
} from 'lucide-react';
import { pollAnswerMachineStatus, AnswerMachinePollingResponse } from '../../utils/answerMachinePollingAxios';
import {
    collectUniqueOpencodeOutputFiles,
    openOpencodeOutputFileInNewTab,
    formatOpencodeFileSize,
    getOpencodeTaskExecutionLabel,
    OpencodeTaskFileRef,
} from '../../utils/opencodeTasksAxios';

const POLLING_INTERVAL = 10000;

interface ComponentAnswerMachineStatusProps {
    threadId: string;
    onComplete?: () => void;
    onStatusUpdate?: () => void;
}

const ComponentAnswerMachineStatus = ({
    threadId,
    onComplete,
    onStatusUpdate,
}: ComponentAnswerMachineStatusProps) => {
    const [status, setStatus] = useState<AnswerMachinePollingResponse>({
        isProcessing: false,
        status: 'not_started',
        jobs: [],
        tokenUsage: { total: 0, prompt: 0, completion: 0, reasoning: 0, costInUsd: 0 },
        perQueryType: {},
    });
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isJobsExpanded, setIsJobsExpanded] = useState(true);
    const [isTokenUsageExpanded, setIsTokenUsageExpanded] = useState(true);
    const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onCompleteRef = useRef(onComplete);
    const onStatusUpdateRef = useRef(onStatusUpdate);
    const threadIdRef = useRef(threadId);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onStatusUpdateRef.current = onStatusUpdate;
        threadIdRef.current = threadId;
    }, [onComplete, onStatusUpdate, threadId]);

    const poll = async () => {
        if (!threadIdRef.current) return;
        try {
            setIsLoading(true);
            const result = await pollAnswerMachineStatus(threadIdRef.current);
            setStatus(result);
            setError(null);
            onStatusUpdateRef.current?.();
            if (!result.isProcessing && result.status === 'answered') {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                if (countdownRef.current) {
                    clearInterval(countdownRef.current);
                    countdownRef.current = null;
                }
                setCountdown(0);
                onCompleteRef.current?.();
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = () => {
        poll();
        if (!countdownRef.current) {
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => (prev <= 1 ? POLLING_INTERVAL / 1000 : prev - 1));
            }, 1000);
        }
        setCountdown(POLLING_INTERVAL / 1000);
    };

    useEffect(() => {
        if (!threadId) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        poll();
        setCountdown(POLLING_INTERVAL / 1000);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? POLLING_INTERVAL / 1000 : prev - 1));
        }, 1000);
        intervalRef.current = setInterval(() => {
            poll();
            setCountdown(POLLING_INTERVAL / 1000);
        }, POLLING_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [threadId]);

    const [opencodeTickNow, setOpencodeTickNow] = useState(() => Date.now());
    useEffect(() => {
        const id = window.setInterval(() => setOpencodeTickNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const toggleJobExpanded = (jobId: string) => {
        setExpandedJobIds((prev) => {
            const next = new Set(prev);
            if (next.has(jobId)) next.delete(jobId);
            else next.add(jobId);
            return next;
        });
    };

    const subQuestionsStatus = status.jobs.reduce(
        (acc, job) => {
            job.subQuestions.forEach((sq) => {
                acc.total++;
                if (sq.status === 'answered') acc.answered++;
                else if (sq.status === 'pending') acc.pending++;
                else if (sq.status === 'error') acc.error++;
            });
            return acc;
        },
        { pending: 0, answered: 0, error: 0, total: 0 }
    );

    const latestJob = status.jobs[0];
    const subQuestions = latestJob?.subQuestions ?? [];
    const opencodeSummary = latestJob?.opencodeExecutionSummary?.trim() || '';
    const opencodeRequestList = Array.isArray(latestJob?.opencodeExecutionRequestList)
        ? latestJob.opencodeExecutionRequestList.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : [];
    const opencodeConversation = typeof latestJob?.opencodeExecutionConversation === 'string'
        ? latestJob.opencodeExecutionConversation.trim()
        : '';
    const opencodeTasks = Array.isArray((latestJob as any)?.opencodeTasks) ? (latestJob as any).opencodeTasks : [];
    const opencodeGeneratedFiles = collectUniqueOpencodeOutputFiles(opencodeTasks);

    const openOpencodeOutputFile = async (f: OpencodeTaskFileRef) => {
        try {
            await openOpencodeOutputFileInNewTab(f);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Could not open file');
        }
    };

    if (status.status === 'answered' && !status.isProcessing && subQuestionsStatus.total === 0) {
        return null;
    }

    const getStatusIcon = () => {
        if (status.status === 'answered') {
            return (
                <div className="flex items-center gap-2">
                    <LucideCheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                </div>
            );
        }
        if (status.status === 'error') {
            return (
                <div className="flex items-center gap-2">
                    <LucideXCircle className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">Error</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <LucideLoader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">Processing</span>
            </div>
        );
    };

    const getStatusText = () => {
        if (status.status === 'answered') return 'Answer Machine completed';
        if (status.status === 'error') return 'Answer Machine encountered an error';
        if (status.status === 'pending' || status.isProcessing) {
            if (subQuestionsStatus.total > 0) {
                const { answered, total } = subQuestionsStatus;
                if (answered === total) return 'Generating final answer...';
                return `Processing sub-questions: ${answered}/${total} answered`;
            }
            return 'Answer Machine is processing...';
        }
        return 'Answer Machine is starting...';
    };

    const getProgressPercentage = () => {
        if (subQuestionsStatus.total === 0) return 0;
        const subQuestionProgress = (subQuestionsStatus.answered / subQuestionsStatus.total) * 80;
        const finalAnswerProgress = status.status === 'answered' ? 20 : 0;
        return Math.min(100, subQuestionProgress + finalAnswerProgress);
    };

    const getPillClassByStatus = (statusText: string) => {
        const map: Record<string, string> = {
            answered: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700',
            skipped: 'bg-gray-100 text-gray-700',
        };
        return map[statusText] ?? 'bg-gray-100 text-gray-700';
    };

    const typeLabels: Record<string, string> = {
        question_generation: 'Question Gen',
        sub_question_answer: 'Sub-Answer',
        evaluation: 'Evaluation',
        final_answer: 'Final Answer',
    };

    return (
        <div className="w-full px-2 py-3">
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex mt-1 mb-2">{getStatusIcon()}</div>

                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <LucideBrain className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">{getStatusText()}</span>
                            {latestJob && latestJob.maxNumberOfIterations > 1 && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                    Iteration {latestJob.currentIteration}/{latestJob.maxNumberOfIterations}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {countdown > 0 && ( <span className="text-xs text-blue-600">Next refresh: {countdown}s</span> )}
                            <button
                                onClick={refresh}
                                disabled={isLoading}
                                className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                                title="Refresh now"
                            >
                                <LucideRefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {status.isProcessing && subQuestionsStatus.total > 0 && (
                        <div className="mt-2">
                            <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${getProgressPercentage()}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-blue-700 mt-1">
                                <span>{subQuestionsStatus.answered} answered</span>
                                <span>{subQuestionsStatus.pending} pending</span>
                                {subQuestionsStatus.error > 0 && (
                                    <span className="text-red-600">{subQuestionsStatus.error} errors</span>
                                )}
                            </div>
                        </div>
                    )}

                    {error && ( <div className="mt-2 text-xs text-red-600">Error: {error.message}</div> )}
                    {status.status === 'answered' && (
                        <div className="mt-2 text-xs text-green-700">
                            Final answer has been generated and added to the conversation.
                        </div>
                    )}

                    {/* Token Usage */}
                    {(status.tokenUsage.total > 0 || status.tokenUsage.costInUsd > 0) && (
                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <button
                                onClick={() => setIsTokenUsageExpanded(!isTokenUsageExpanded)}
                                className="w-full flex items-center justify-between text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <LucideCoins className="w-4 h-4 text-blue-600" />
                                    <span>Token Usage</span>
                                </div>
                                {isTokenUsageExpanded ? <LucideChevronUp className="w-4 h-4" /> : <LucideChevronDown className="w-4 h-4" />}
                            </button>
                            {isTokenUsageExpanded && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white rounded-sm p-2 border border-blue-100">
                                            <div className="text-gray-600">Total Tokens</div>
                                            <div className="text-lg font-semibold text-blue-700">{(status.tokenUsage.total).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-white rounded-sm p-2 border border-blue-100">
                                            <div className="text-gray-600">Cost</div>
                                            <div className="text-lg font-semibold text-blue-700">${status.tokenUsage.costInUsd.toFixed(6)}</div>
                                        </div>
                                        <div className="bg-white rounded-sm p-2 border border-blue-100">
                                            <div className="text-gray-600">Prompt</div>
                                            <div className="text-sm font-medium text-gray-700">{status.tokenUsage.prompt.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-white rounded-sm p-2 border border-blue-100">
                                            <div className="text-gray-600">Completion</div>
                                            <div className="text-sm font-medium text-gray-700">{status.tokenUsage.completion.toLocaleString()}</div>
                                        </div>
                                        {status.tokenUsage.reasoning > 0 && (
                                            <div className="bg-white rounded-sm p-2 border border-blue-100 col-span-2">
                                                <div className="text-gray-600">Reasoning</div>
                                                <div className="text-sm font-medium text-gray-700">{status.tokenUsage.reasoning.toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                    {Object.keys(status.perQueryType).length > 0 && (
                                        <div className="mt-3 border-t border-blue-200 pt-3">
                                            <div className="text-xs font-medium text-blue-900 mb-2">Per Query Type</div>
                                            <div className="space-y-2">
                                                {Object.entries(status.perQueryType)
                                                    .sort(([, a], [, b]) => b.totalTokens - a.totalTokens)
                                                    .map(([type, data]) => (
                                                        <div key={type} className="bg-white rounded-sm p-2 border border-blue-100 text-xs">
                                                            <div className="font-medium text-gray-800 mb-1">
                                                                {typeLabels[type] || type}
                                                                {data.count > 1 && <span className="text-gray-500 ml-1">({data.count} queries)</span>}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1 text-gray-600">
                                                                <div><span className="text-gray-500">Total:</span> <span className="font-medium">{data.totalTokens.toLocaleString()}</span></div>
                                                                <div><span className="text-gray-500">Max per query:</span> <span className="font-medium text-blue-600">{data.maxTokensPerQuery.toLocaleString()}</span></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Jobs - expand/collapse per job */}
                    {status.jobs.length > 0 && (
                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <button
                                onClick={() => setIsJobsExpanded(!isJobsExpanded)}
                                className="w-full flex items-center justify-between text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <LucideBrain className="w-4 h-4" />
                                    <span>Job List ({status.jobs.length})</span>
                                </div>
                                {isJobsExpanded ? <LucideChevronUp className="w-4 h-4" /> : <LucideChevronDown className="w-4 h-4" />}
                            </button>
                            {isJobsExpanded && (
                                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                                    {status.jobs.map((job, index) => {
                                        const isJobExpanded = expandedJobIds.has(job.id);
                                        return (
                                            <div key={job.id} className="bg-white rounded-sm border border-blue-100 overflow-hidden">
                                                <button
                                                    onClick={() => toggleJobExpanded(job.id)}
                                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                            Job {status.jobs.length - index}
                                                        </span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPillClassByStatus(job.status)}`}>
                                                            {job.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Iteration {job.currentIteration}/{job.maxNumberOfIterations}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {job.subQuestions.length} sub-questions
                                                        </span>
                                                    </div>
                                                    {isJobExpanded ? <LucideChevronUp className="w-4 h-4" /> : <LucideChevronDown className="w-4 h-4" />}
                                                </button>
                                                {isJobExpanded && (
                                                    <div className="px-3 pb-3 pt-0 space-y-2 border-t border-blue-100">
                                                        {job.subQuestions.map((sq, sqIndex) => (
                                                            <div key={sq.id} className="border border-gray-200 rounded-sm p-2 bg-gray-50">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-semibold text-blue-600">Q{sqIndex + 1}</span>
                                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPillClassByStatus(sq.status)}`}>{sq.status}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-800 whitespace-pre-wrap">{sq.question || 'N/A'}</div>
                                                                {sq.answer && (
                                                                    <div className="text-xs text-gray-700 mt-1 whitespace-pre-wrap"><strong>Answer:</strong> {sq.answer}</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* OpenCode Execution */}
                    {status.jobs.length > 0 && (
                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <div className="w-full flex items-center justify-between text-sm font-medium text-blue-900 mb-2">
                                <div className="flex items-center gap-2">
                                    <LucideTerminal className="w-4 h-4" />
                                    <span>OpenCode Execution</span>
                                </div>
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                        latestJob?.usedOpencode
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {latestJob?.usedOpencode ? 'enabled' : 'disabled'}
                                </span>
                            </div>
                            <div className="bg-white rounded-sm border border-blue-100 p-3">
                                {opencodeSummary.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[11px] font-semibold text-blue-900 mb-1">Summary</div>
                                        <div className="text-xs text-gray-800 whitespace-pre-wrap">{opencodeSummary}</div>
                                    </div>
                                )}

                                {opencodeRequestList.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-[11px] font-semibold text-blue-900 mb-1">Request List</div>
                                        <ol className="list-decimal pl-4 space-y-1 text-xs text-gray-800">
                                            {opencodeRequestList.map((request, idx) => (
                                                <li key={`opencode-request-${idx}`} className="whitespace-pre-wrap">
                                                    {request}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {opencodeConversation.length > 0 && (
                                    <div>
                                        <div className="text-[11px] font-semibold text-blue-900 mb-1">Complete Conversation</div>
                                        <div className="max-h-40 overflow-y-auto rounded border border-blue-100 bg-blue-50/40 p-2 text-xs text-gray-800 whitespace-pre-wrap">
                                            {opencodeConversation}
                                        </div>
                                    </div>
                                )}

                                {opencodeGeneratedFiles.length > 0 && (
                                    <div className={opencodeConversation.length > 0 ? 'mt-3' : ''}>
                                        <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-900 mb-2">
                                            <LucideFile className="w-3.5 h-3.5 shrink-0" />
                                            <span>Generated files ({opencodeGeneratedFiles.length})</span>
                                        </div>
                                        <ul className="space-y-1.5 rounded border border-blue-100 bg-blue-50/30 p-2">
                                            {opencodeGeneratedFiles.map((f) => (
                                                <li
                                                    key={f.filePath}
                                                    className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs"
                                                >
                                                    <button
                                                        type="button"
                                                        className="text-blue-700 hover:underline font-medium break-all text-left bg-transparent border-0 p-0 cursor-pointer"
                                                        onClick={() => void openOpencodeOutputFile(f)}
                                                    >
                                                        {f.fileName || f.filePath}
                                                    </button>
                                                    <span className="text-gray-500 shrink-0">
                                                        {formatOpencodeFileSize(f.size)}
                                                        {f.contentType ? ` · ${f.contentType}` : ''}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {opencodeTasks.length > 0 && (
                                    <div className={opencodeConversation.length > 0 ? "mt-3" : ""}>
                                        <div className="text-[11px] font-semibold text-blue-900 mb-1">Tasks</div>
                                        <div className="space-y-2">
                                            {opencodeTasks.map((t: any) => (
                                                <div key={`opencode-task-${t.id}`} className="rounded border border-blue-100 bg-blue-50/30 p-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="text-xs font-medium text-gray-900">{t.title || 'Task'}</div>
                                                        <div className="text-[11px] text-gray-600 text-right leading-tight">
                                                            <div className="capitalize">{t.status}</div>
                                                            {(() => {
                                                                const exec = getOpencodeTaskExecutionLabel(t, opencodeTickNow);
                                                                return exec ? (
                                                                    <div className="text-[10px] text-gray-500 font-normal">
                                                                        {exec}
                                                                    </div>
                                                                ) : null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                    {(t.summary || t.errorReason) && (
                                                        <div className="mt-1 text-xs text-gray-800 whitespace-pre-wrap">
                                                            {t.errorReason ? t.errorReason : t.summary}
                                                        </div>
                                                    )}
                                                    {((typeof t.instruction === 'string' && t.instruction.trim().length > 0) ||
                                                        (typeof t.agentTranscript === 'string' &&
                                                            t.agentTranscript.trim().length > 0)) && (
                                                        <details className="mt-2 group rounded border border-blue-100/80 bg-white/60 open:bg-white">
                                                            <summary className="cursor-pointer list-none px-2 py-1.5 text-[11px] font-medium text-blue-800 hover:bg-blue-50/60 rounded [&::-webkit-details-marker]:hidden flex items-center gap-1.5">
                                                                <span className="inline-block w-0 h-0 border-l-[5px] border-l-blue-700 border-y-[3.5px] border-y-transparent group-open:rotate-90 transition-transform" />
                                                                Instruction & agent messages
                                                            </summary>
                                                            <div className="px-2 pb-2 pt-0 space-y-2 border-t border-blue-100/60">
                                                                {typeof t.instruction === 'string' && t.instruction.trim().length > 0 && (
                                                                    <div>
                                                                        <div className="text-[10px] font-semibold text-gray-600 mt-2 mb-0.5">
                                                                            Instruction
                                                                        </div>
                                                                        <pre className="text-[10px] text-gray-800 whitespace-pre-wrap font-mono leading-snug max-h-48 overflow-y-auto">
                                                                            {t.instruction}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {typeof t.agentTranscript === 'string' &&
                                                                t.agentTranscript.trim().length > 0 ? (
                                                                    <div>
                                                                        <div className="text-[10px] font-semibold text-gray-600 mb-0.5">
                                                                            Agent (OpenCode)
                                                                        </div>
                                                                        <pre className="text-[10px] text-gray-800 whitespace-pre-wrap font-mono leading-snug max-h-64 overflow-y-auto">
                                                                            {t.agentTranscript}
                                                                        </pre>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] text-gray-500 italic pt-1">
                                                                        Agent message log appears here after this task
                                                                        completes.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </details>
                                                    )}
                                                    {Array.isArray(t.outputFileRefs) && t.outputFileRefs.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-[11px] font-medium text-gray-600">Output</div>
                                                            {t.outputFileRefs.map((f: OpencodeTaskFileRef) => (
                                                                <div
                                                                    key={`${t.id}-${f.filePath}`}
                                                                    className="text-xs pl-1 border-l-2 border-blue-100"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="text-blue-700 hover:underline break-all text-left bg-transparent border-0 p-0 cursor-pointer"
                                                                        onClick={() => void openOpencodeOutputFile(f)}
                                                                    >
                                                                        {f.fileName || f.filePath}
                                                                    </button>
                                                                    {typeof f.size === 'number' && (
                                                                        <span className="text-gray-500 ml-1">
                                                                            ({formatOpencodeFileSize(f.size)})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {opencodeSummary.length === 0 &&
                                    opencodeRequestList.length === 0 &&
                                    opencodeConversation.length === 0 &&
                                    opencodeTasks.length === 0 && (
                                    <div className="text-xs text-gray-500">
                                        No OpenCode execution details available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Current sub-questions (from latest job) */}
                    {subQuestions.length > 0 && (
                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full flex items-center justify-between text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <LucideHelpCircle className="w-4 h-4" />
                                    <span>Sub-Questions ({subQuestions.length})</span>
                                </div>
                                {isExpanded ? <LucideChevronUp className="w-4 h-4" /> : <LucideChevronDown className="w-4 h-4" />}
                            </button>
                            {isExpanded && (
                                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                                    {subQuestions.map((sq, index) => (
                                        <div key={sq.id} className="bg-white rounded-sm p-3 border border-blue-100">
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Q{index + 1}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${getPillClassByStatus(sq.status)}`}>{sq.status}</span>
                                            </div>
                                            <div className="text-sm text-gray-800 mb-2"><strong>Question:</strong> {sq.question || 'N/A'}</div>
                                            {sq.status === 'answered' && sq.answer && (
                                                <div className="text-sm text-gray-700 bg-gray-50 rounded-sm p-2 mt-2">
                                                    <strong>Answer:</strong>
                                                    <div className="mt-1 whitespace-pre-wrap">{sq.answer}</div>
                                                </div>
                                            )}
                                            {sq.status === 'pending' && (
                                                <div className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                                    <LucideLoader2 className="w-3 h-3 animate-spin" /> Processing...
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentAnswerMachineStatus;
