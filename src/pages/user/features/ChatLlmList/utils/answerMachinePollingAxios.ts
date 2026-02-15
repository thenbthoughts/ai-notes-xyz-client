import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface AnswerMachineJob {
    id: string;
    status: string;
    currentIteration: number;
    maxNumberOfIterations: number;
    subQuestions: Array<{
        id: string;
        question: string;
        answer: string;
        status: string;
    }>;
}

export interface AnswerMachinePollingResponse {
    isProcessing: boolean;
    status: 'pending' | 'answered' | 'error' | 'not_started';
    jobs: AnswerMachineJob[];
    tokenUsage: {
        total: number;
        prompt: number;
        completion: number;
        reasoning: number;
        costInUsd: number;
    };
    perQueryType: Record<string, {
        totalTokens: number;
        maxTokensPerQuery: number;
        count: number;
    }>;
}

export const pollAnswerMachineStatus = async (
    threadId: string
): Promise<AnswerMachinePollingResponse> => {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/answerMachineStatus',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId },
    };
    const response = await axiosCustom.request(config);
    return response.data;
};
