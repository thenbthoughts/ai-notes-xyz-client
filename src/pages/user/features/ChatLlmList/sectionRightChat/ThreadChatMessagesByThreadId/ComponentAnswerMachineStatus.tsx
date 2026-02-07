import { useState } from 'react';
import { LucideLoader2, LucideCheckCircle2, LucideXCircle, LucideBrain, LucideChevronDown, LucideChevronUp, LucideHelpCircle, LucideRefreshCw, LucideCoins } from 'lucide-react';
import { useAnswerMachinePolling } from '../../utils/useAnswerMachinePolling';

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTokenUsageExpanded, setIsTokenUsageExpanded] = useState(true);
    
    const { 
        isProcessing, 
        status, 
        subQuestionsStatus, 
        subQuestions, 
        error, 
        isLoading, 
        countdown, 
        refresh,
        answerMachineMinNumberOfIterations,
        answerMachineMaxNumberOfIterations,
        answerMachineCurrentIteration,
        answerMachineErrorReason,
        answerMachinePromptTokens,
        answerMachineCompletionTokens,
        answerMachineReasoningTokens,
        answerMachineTotalTokens,
        answerMachineCostInUsd,
        answerMachineQueryTypes,
        answerMachineQueryTypeTokens,
    } = useAnswerMachinePolling({
        threadId,
        onComplete,
        onStatusUpdate,
    });

    // Always show when Answer Machine is selected (parent component handles this)
    // Hide only when explicitly completed and not processing
    if (status === 'answered' && !isProcessing && subQuestionsStatus.total === 0) {
        return null;
    }

    const getStatusIcon = () => {
        if (status === 'answered') {
            return (
                <div className="flex items-center gap-2">
                    <LucideCheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                </div>
            );
        }
        if (status === 'error') {
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
        if (status === 'answered') {
            return 'Answer Machine completed';
        }
        if (status === 'error') {
            return 'Answer Machine encountered an error';
        }
        if (status === 'pending' || isProcessing) {
            if (subQuestionsStatus.total > 0) {
                const answered = subQuestionsStatus.answered;
                const total = subQuestionsStatus.total;
                if (answered === total) {
                    return 'Generating final answer...';
                }
                return `Processing sub-questions: ${answered}/${total} answered`;
            }
            return 'Answer Machine is processing...';
        }
        return 'Answer Machine is starting...';
    };

    const getProgressPercentage = () => {
        if (subQuestionsStatus.total === 0) {
            return 0;
        }
        const subQuestionProgress = (subQuestionsStatus.answered / subQuestionsStatus.total) * 80;
        const finalAnswerProgress = status === 'answered' ? 20 : 0;
        return Math.min(100, subQuestionProgress + finalAnswerProgress);
    };

    return (
        <div className="w-full px-2 py-3">
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex mt-1 mb-2">
                        {getStatusIcon()}
                    </div>

                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <LucideBrain className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                {getStatusText()}
                            </span>
                            {answerMachineMaxNumberOfIterations > 1 && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                    Iteration {answerMachineCurrentIteration}/{answerMachineMaxNumberOfIterations}
                                    {answerMachineMinNumberOfIterations > 1 && answerMachineCurrentIteration < answerMachineMinNumberOfIterations && (
                                        <span className="ml-1 text-blue-500">(min: {answerMachineMinNumberOfIterations})</span>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {countdown > 0 && (
                                <span className="text-xs text-blue-600">
                                    Next refresh: {countdown}s
                                </span>
                            )}
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
                    
                    {answerMachineErrorReason && (
                        <div className="mt-2 text-xs text-red-600">
                            Error: {answerMachineErrorReason}
                        </div>
                    )}
                    
                    {isProcessing && subQuestionsStatus.total > 0 && (
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

                    {error && (
                        <div className="mt-2 text-xs text-red-600">
                            Error: {error.message}
                        </div>
                    )}

                    {status === 'answered' && (
                        <div className="mt-2 text-xs text-green-700">
                            Final answer has been generated and added to the conversation.
                        </div>
                    )}

                    {/* Token Usage Display */}
                    {(answerMachineTotalTokens > 0 || answerMachineCostInUsd > 0) && (
                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <button
                                onClick={() => setIsTokenUsageExpanded(!isTokenUsageExpanded)}
                                className="w-full flex items-center justify-between text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <LucideCoins className="w-4 h-4 text-blue-600" />
                                    <span>Token Usage</span>
                                </div>
                                {isTokenUsageExpanded ? (
                                    <LucideChevronUp className="w-4 h-4" />
                                ) : (
                                    <LucideChevronDown className="w-4 h-4" />
                                )}
                            </button>
                            
                            {isTokenUsageExpanded && (
                                <>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white rounded-sm p-2 border border-blue-100">
                                    <div className="text-gray-600">Total Tokens</div>
                                    <div className="text-lg font-semibold text-blue-700">
                                        {answerMachineTotalTokens.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white rounded-sm p-2 border border-blue-100">
                                    <div className="text-gray-600">Cost</div>
                                    <div className="text-lg font-semibold text-blue-700">
                                        ${answerMachineCostInUsd.toFixed(6)}
                                    </div>
                                </div>
                                <div className="bg-white rounded-sm p-2 border border-blue-100">
                                    <div className="text-gray-600">Prompt</div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {answerMachinePromptTokens.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white rounded-sm p-2 border border-blue-100">
                                    <div className="text-gray-600">Completion</div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {answerMachineCompletionTokens.toLocaleString()}
                                    </div>
                                </div>
                                {answerMachineReasoningTokens > 0 && (
                                    <div className="bg-white rounded-sm p-2 border border-blue-100 col-span-2">
                                        <div className="text-gray-600">Reasoning</div>
                                        <div className="text-sm font-medium text-gray-700">
                                            {answerMachineReasoningTokens.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Query Types Breakdown */}
                            {answerMachineQueryTypes && answerMachineQueryTypes.length > 0 && (
                                <div className="mt-3 border-t border-blue-200 pt-3">
                                    <div className="text-xs font-medium text-blue-900 mb-2">Query Types Used</div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {answerMachineQueryTypes.map((type) => {
                                            const typeLabels: { [key: string]: string } = {
                                                'question_generation': 'Question Gen',
                                                'sub_question_answer': 'Sub-Answer',
                                                'intermediate_answer': 'Intermediate',
                                                'evaluation': 'Evaluation',
                                                'final_answer': 'Final Answer',
                                            };
                                            return (
                                                <span
                                                    key={type}
                                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                                >
                                                    {typeLabels[type] || type}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Per-Query-Type Token Breakdown */}
                                    {answerMachineQueryTypeTokens && Object.keys(answerMachineQueryTypeTokens).length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            <div className="text-xs font-medium text-blue-900 mb-1">Token Breakdown by Query Type</div>
                                            {Object.entries(answerMachineQueryTypeTokens)
                                                .sort(([, a]: [string, any], [, b]: [string, any]) => b.totalTokens - a.totalTokens) // Sort by total tokens descending
                                                .map(([type, tokens]: [string, any]) => {
                                                    const typeLabels: { [key: string]: string } = {
                                                        'question_generation': 'Question Generation',
                                                        'sub_question_answer': 'Sub-Question Answer',
                                                        'intermediate_answer': 'Intermediate Answer',
                                                        'evaluation': 'Evaluation',
                                                        'final_answer': 'Final Answer',
                                                    };
                                                    const avgTokens = tokens.count > 0 ? Math.round(tokens.totalTokens / tokens.count) : 0;
                                                    const maxSingleQueryTokens = tokens.maxSingleQueryTokens || tokens.totalTokens; // Max tokens from a single execution
                                                    
                                                    return (
                                                        <div
                                                            key={type}
                                                            className="bg-white rounded-sm p-2 border border-blue-100 text-xs"
                                                        >
                                                            <div className="font-medium text-gray-800 mb-1">
                                                                {typeLabels[type] || type}
                                                                {tokens.count > 1 && (
                                                                    <span className="text-gray-500 ml-1">({tokens.count} executions)</span>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1 text-gray-600">
                                                                <div>
                                                                    <span className="text-gray-500">Total Tokens:</span>{' '}
                                                                    <span className="font-medium">{tokens.totalTokens.toLocaleString()}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Max (Single Query):</span>{' '}
                                                                    <span className="font-medium text-blue-600">{maxSingleQueryTokens.toLocaleString()}</span>
                                                                </div>
                                                                {tokens.count > 1 && (
                                                                    <div>
                                                                        <span className="text-gray-500">Avg per Execution:</span>{' '}
                                                                        <span className="font-medium">{avgTokens.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-gray-500">Cost:</span>{' '}
                                                                    <span className="font-medium">${tokens.costInUsd.toFixed(6)}</span>
                                                                </div>
                                                            </div>
                                                            {/* Additional breakdown for multiple executions */}
                                                            {tokens.count > 1 && (
                                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                                    <div className="text-xs text-gray-500">
                                                                        <span className="font-medium">Prompt:</span> {tokens.promptTokens.toLocaleString()} |{' '}
                                                                        <span className="font-medium">Completion:</span> {tokens.completionTokens.toLocaleString()}
                                                                        {tokens.reasoningTokens > 0 && (
                                                                            <> | <span className="font-medium">Reasoning:</span> {tokens.reasoningTokens.toLocaleString()}</>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            )}
                                </>
                            )}
                        </div>
                    )}

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
                                {isExpanded ? (
                                    <LucideChevronUp className="w-4 h-4" />
                                ) : (
                                    <LucideChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                                    {subQuestions.map((sq, index) => (
                                        <div
                                            key={sq.id}
                                            className="bg-white rounded-sm p-3 border border-blue-100"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    Q{index + 1}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                    sq.status === 'answered' ? 'bg-green-100 text-green-700' :
                                                    sq.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    sq.status === 'error' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {sq.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-800 mb-2">
                                                <strong>Question:</strong> {sq.question || 'N/A'}
                                            </div>
                                            {sq.status === 'answered' && sq.answer && (
                                                <div className="text-sm text-gray-700 bg-gray-50 rounded-sm p-2 mt-2">
                                                    <strong>Answer:</strong>
                                                    <div className="mt-1 whitespace-pre-wrap">{sq.answer}</div>
                                                </div>
                                            )}
                                            {sq.status === 'error' && sq.errorReason && (
                                                <div className="text-xs text-red-600 mt-2">
                                                    <strong>Error:</strong> {sq.errorReason}
                                                </div>
                                            )}
                                            {sq.status === 'pending' && (
                                                <div className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                                    <LucideLoader2 className="w-3 h-3 animate-spin" />
                                                    Processing...
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
