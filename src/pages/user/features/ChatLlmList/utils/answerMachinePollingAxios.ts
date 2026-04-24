import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface AnswerMachineJob {
    id: string;
    status: string;
    usedOpencode: boolean;
    opencodeExecutionSummary: string;
    opencodeExecutionRequestList: string[];
    opencodeExecutionConversation: string;
    opencodeTasks: Array<{
        id: string;
        sortIndex: number;
        title: string;
        instruction: string;
        status: string;
        summary: string;
        errorReason: string;
        agentTranscript: string;
        runStartedAtUtc?: string | null;
        runFinishedAtUtc?: string | null;
        executionDurationMs?: number | null;
        outputFileRefs: Array<{
            fileName: string;
            filePath: string;
            contentType: string;
            size: number;
        }>;
    }>;
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
