import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { pollAnswerMachineStatus, AnswerMachinePollingResponse } from '../../utils/answerMachinePollingAxios';

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

    const intervalRef = useRef<number | null>(null);
    const countdownRef = useRef<number | null>(null);
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
