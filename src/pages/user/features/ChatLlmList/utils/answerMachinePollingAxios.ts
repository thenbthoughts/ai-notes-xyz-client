import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface SubQuestionDetail {
    id: string;
    question: string;
    answer: string;
    status: 'pending' | 'answered' | 'error' | 'skipped';
    errorReason?: string;
}

export interface AnswerMachineJobDetail {
    id: string;
    parentMessageId: string;
    status: 'pending' | 'answered' | 'error';
    errorReason: string;
    finalAnswer: string;
    intermediateAnswers: string[];
    minNumberOfIterations: number;
    maxNumberOfIterations: number;
    currentIteration: number;
    subQuestions: SubQuestionDetail[];
    createdAt: string;
    updatedAt: string;
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
