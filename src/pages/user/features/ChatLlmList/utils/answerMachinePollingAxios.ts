import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface SubQuestionDetail {
    id: string;
    question: string;
    answer: string;
    status: 'pending' | 'answered' | 'error' | 'skipped';
    errorReason?: string;
}

export interface AnswerMachinePollingStatus {
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
    hasFinalAnswer: boolean;
    lastMessageIsAi: boolean;
    // Answer Machine iteration info
    answerMachineMinNumberOfIterations: number;
    answerMachineMaxNumberOfIterations: number;
    answerMachineCurrentIteration: number;
    answerMachineStatus: 'not_started' | 'pending' | 'answered' | 'error';
    answerMachineErrorReason: string;
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
    // All answer machine runs
    answerMachineRuns: AnswerMachineRun[];
}

export interface AnswerMachineRun {
    id: string;
    createdAtUtc: string;
    status: 'pending' | 'answered' | 'error' | 'not_started';
    errorReason: string;
    currentIteration: number;
    intermediateAnswers: string[];
    finalAnswer: string;
    subQuestionsStatus: {
        pending: number;
        answered: number;
        error: number;
        skipped: number;
        total: number;
    };
    subQuestions: SubQuestionDetail[];
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalReasoningTokens: number;
    totalTokens: number;
    costInUsd: number;
    queryTypes: string[];
    queryTypeTokens: {
        [key: string]: {
            promptTokens: number;
            completionTokens: number;
            reasoningTokens: number;
            totalTokens: number;
            costInUsd: number;
            count: number;
            maxSingleQueryTokens?: number;
        };
    };
}

export const pollAnswerMachineStatus = async (
    threadId: string
): Promise<AnswerMachinePollingStatus> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/chat-llm/polling/answerMachineStatus',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                threadId: threadId,
            },
        };

        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error polling Answer Machine status:', error);
        throw error;
    }
};
