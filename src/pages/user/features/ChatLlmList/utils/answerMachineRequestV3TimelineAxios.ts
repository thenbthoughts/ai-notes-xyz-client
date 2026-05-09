import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface AnswerMachineRequestV3UnionThreadItem {
    unionKind: 'thread' | 'am3_request';
    sortAt: string;
    thread?: {
        _id: string;
        threadTitle: string;
        answerEngine: string;
        createdAtUtc: string | null;
        updatedAtUtc: string | null;
    };
    request?: {
        _id: string;
        parentMessageId: string;
        status: string;
        errorReason: string;
        currentIteration: number;
        maxNumberOfIterations: number;
        totalTokens: number;
        costInUsd: number;
        createdAt: string;
        updatedAt: string;
    };
}

/** Prefer `threadAm3UnionTimeline` from `POST /api/chat-llm/crud/notesGet`. This calls the standalone union endpoint. */
export async function fetchAnswerMachineRequestV3UnionThread(threadId: string): Promise<AnswerMachineRequestV3UnionThreadItem[]> {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/answerMachineRequestV3UnionThread',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId },
    };
    const response = await axiosCustom.request<{ items: AnswerMachineRequestV3UnionThreadItem[] }>(config);
    return response.data.items ?? [];
}

export interface AnswerMachineRequestV3PollRow {
    _id: string;
    parentMessageId: string;
    status: string;
    errorReason: string;
    currentIteration: number;
    maxNumberOfIterations: number;
    totalTokens: number;
    costInUsd: number;
    createdAt: string;
    updatedAt: string;
}

export async function pollAnswerMachineRequestV3List(threadId: string): Promise<{
    answerEngine: string;
    requests: AnswerMachineRequestV3PollRow[];
}> {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/answerMachineRequestV3List',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId },
    };
    const response = await axiosCustom.request<{ answerEngine: string; requests: AnswerMachineRequestV3PollRow[] }>(config);
    return response.data;
}
