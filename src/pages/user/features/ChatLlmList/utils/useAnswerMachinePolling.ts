import { useEffect, useState, useRef } from 'react';
import { pollAnswerMachineStatus, AnswerMachinePollingStatus, SubQuestionDetail, AnswerMachineJobDetail } from './answerMachinePollingAxios';

interface UseAnswerMachinePollingReturn {
    isProcessing: boolean;
    status: 'pending' | 'answered' | 'error' | 'not_started';
    subQuestionsStatus: {
        pending: number;
        answered: number;
        error: number;
        skipped: number;
        total: number;
    };
    subQuestions: SubQuestionDetail[];
    error: Error | null;
    isLoading: boolean;
    countdown: number;
    refresh: () => void;
    // Answer Machine iteration info
    answerMachineMinNumberOfIterations: number;
    answerMachineMaxNumberOfIterations: number;
    // Answer Machine token tracking
    answerMachinePromptTokens: number;
    answerMachineCompletionTokens: number;
    answerMachineReasoningTokens: number;
    answerMachineTotalTokens: number;
    answerMachineCostInUsd: number;
    // Query types used
    answerMachineQueryTypes: string[];
    // Per-query-type token breakdown
    answerMachineQueryTypeTokens: {
        [key: string]: {
            promptTokens: number;
            completionTokens: number;
            reasoningTokens: number;
            totalTokens: number;
            costInUsd: number;
            count: number;
            maxSingleQueryTokens?: number; // Maximum tokens from a single execution
        };
    };
    answerMachineJobs: AnswerMachineJobDetail[];
}

const POLLING_INTERVAL = 10000; // 10 seconds

export const useAnswerMachinePolling = ({
    threadId,
    onComplete,
    onStatusUpdate,
}: {
    threadId: string;
    onComplete?: () => void;
    onStatusUpdate?: () => void;
}): UseAnswerMachinePollingReturn => {

    const [status, setStatus] = useState<AnswerMachinePollingStatus>({
        isProcessing: false,
        status: 'not_started',
        subQuestionsStatus: {
            pending: 0,
            answered: 0,
            error: 0,
            skipped: 0,
            total: 0,
        },
        subQuestions: [],
        hasFinalAnswer: false,
        lastMessageIsAi: false,
        answerMachineMinNumberOfIterations: 1,
        answerMachineMaxNumberOfIterations: 1,
        answerMachinePromptTokens: 0,
        answerMachineCompletionTokens: 0,
        answerMachineReasoningTokens: 0,
        answerMachineTotalTokens: 0,
        answerMachineCostInUsd: 0,
        answerMachineQueryTypes: [],
        answerMachineQueryTypeTokens: {},
        answerMachineJobs: [],
    });
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

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
        if (!threadIdRef.current) {
            return;
        }

        try {
            setIsLoading(true);
            const result = await pollAnswerMachineStatus(threadIdRef.current);

            setStatus(result);
            setError(null);

            if (onStatusUpdateRef.current) {
                onStatusUpdateRef.current();
            }

            // Stop polling if completed
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
                if (onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async () => {
        await poll();
        // Restart countdown timer if it's not already running
        if (!countdownRef.current) {
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        return POLLING_INTERVAL / 1000;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        setCountdown(POLLING_INTERVAL / 1000);
    };

    useEffect(() => {
        if (!threadId) {
            return;
        }

        // Cleanup previous intervals
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        // Initial poll immediately
        poll();
        setCountdown(POLLING_INTERVAL / 1000);

        // Start countdown timer
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return POLLING_INTERVAL / 1000;
                }
                return prev - 1;
            });
        }, 1000);

        // Start polling interval
        intervalRef.current = setInterval(() => {
            poll();
            setCountdown(POLLING_INTERVAL / 1000);
        }, POLLING_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, [threadId]);

    return {
        isProcessing: status.isProcessing,
        status: status.status,
        subQuestionsStatus: status.subQuestionsStatus,
        subQuestions: status.subQuestions || [],
        error,
        isLoading,
        countdown,
        refresh,
        answerMachineMinNumberOfIterations: status.answerMachineMinNumberOfIterations,
        answerMachineMaxNumberOfIterations: status.answerMachineMaxNumberOfIterations,
        answerMachinePromptTokens: status.answerMachinePromptTokens || 0,
        answerMachineCompletionTokens: status.answerMachineCompletionTokens || 0,
        answerMachineReasoningTokens: status.answerMachineReasoningTokens || 0,
        answerMachineTotalTokens: status.answerMachineTotalTokens || 0,
        answerMachineCostInUsd: status.answerMachineCostInUsd || 0,
        answerMachineQueryTypes: status.answerMachineQueryTypes || [],
        answerMachineQueryTypeTokens: status.answerMachineQueryTypeTokens || {},
        answerMachineJobs: status.answerMachineJobs || [],
    };
};
