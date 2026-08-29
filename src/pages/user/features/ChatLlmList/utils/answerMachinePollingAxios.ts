import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface AgentPollingResponse {
    isProcessing: boolean;
    status: 'pending' | 'success' | 'failed' | 'running' | 'paused' | 'stopped' | 'completed' | 'error' | 'not_started';
    brainStep?: 'think' | 'plan' | 'use_tool' | 'observe' | 'final_answer' | 'done' | null;
    agentInstanceId: string | null;
    tickCount: number;
    goals: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        result: string;
        orderIndex: number;
        parentGoalId?: string | null;
    }>;
    updates: Array<{
        id: string;
        updateType: string;
        message: string;
        tickNumber: number;
        createdAtUtc: string;
        payload: Record<string, unknown>;
    }>;
    logs: Array<{
        id: string;
        level: string;
        action: string;
        title: string;
        message: string;
        tickNumber: number;
        createdAtUtc: string;
        payload: Record<string, unknown>;
        raw: unknown;
        past?: boolean;
    }>;
    memoryCount: number;
    memories?: Array<{
        id: string;
        key: string;
        memoryType: string;
        content: string;
        createdAtUtc: string;
        past?: boolean;
    }>;
    tokenUsage?: {
        prompt: number;
        completion: number;
        reasoning: number;
        total: number;
        costInUsd: number;
        maxPromptPerQuery?: number;
        maxCompletionPerQuery?: number;
        llmRequestCount?: number;
    };
    threadUsage?: {
        prompt: number;
        completion: number;
        reasoning: number;
        total: number;
        costInUsd: number;
        maxPromptPerQuery?: number;
        maxCompletionPerQuery?: number;
        llmRequestCount?: number;
    };
    budget?: {
        tokens: {
            used: number;
            min: number;
            max: number;
            remaining: number;
            pctUsed: number;
            pctRemaining: number;
        };
        iterations: {
            used: number;
            min: number;
            max: number;
            remaining: number;
            pctUsed: number;
            pctRemaining: number;
        };
        minsMet: boolean;
        maxExceeded: boolean;
        nearMax: boolean;
    };
    memoryStats?: {
        total: number;
        byType: Record<string, number>;
    };
    activeSkillNames?: string[];
    researchState?: {
        phase: 'idle' | 'plan' | 'tool' | 'verify' | 'synthesize' | 'done' | 'error';
        sourcesSeen: string[];
        evidenceGaps: string[];
        suggestedNextAction: string | null;
        suggestedQuery: string | null;
        researchBriefPreview: string | null;
        lastVerifyVerdict: string | null;
        confidence: 'low' | 'medium' | 'high';
    };
    instances?: Array<{
        id: string;
        status: 'pending' | 'success' | 'failed';
        brainStep: 'think' | 'plan' | 'use_tool' | 'observe' | 'final_answer' | 'done' | null;
        tickCount: number;
        summary: string;
        goalTitle: string;
        errorReason: string;
        createdAtUtc: string;
        updatedAtUtc: string;
        completedAtUtc?: string;
        durationMs?: number;
        totalTokens: number;
        costInUsd: number;
        llmRequestCount?: number;
        usage?: {
            prompt: number;
            completion: number;
            reasoning: number;
            total: number;
            costInUsd: number;
            maxPromptPerQuery?: number;
            maxCompletionPerQuery?: number;
            llmRequestCount?: number;
        };
        activeSkillNames?: string[];
        memoryByType?: Record<string, number>;
        goals?: Array<{
            id: string;
            title: string;
            status: string;
            parentGoalId: string | null;
        }>;
        latestUpdate?: string;
        isLatest: boolean;
    }>;
}

export const pollAgentStatus = async (
    threadId: string,
    opts?: {
        sinceUpdateId?: string | null;
        sinceLogId?: string | null;
        agentInstanceId?: string | null;
    }
): Promise<AgentPollingResponse> => {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/agentStatus',
        headers: { 'Content-Type': 'application/json' },
        data: {
            threadId,
            ...(opts?.sinceUpdateId ? { sinceUpdateId: opts.sinceUpdateId } : {}),
            ...(opts?.sinceLogId ? { sinceLogId: opts.sinceLogId } : {}),
            ...(opts?.agentInstanceId ? { agentInstanceId: opts.agentInstanceId } : {}),
        },
    };
    const response = await axiosCustom.request(config);
    return response.data;
};

export const cancelAgentRunByThreadId = async (threadId: string): Promise<void> => {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/agentCancel',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId },
    };
    await axiosCustom.request(config);
};

export const agentPollIndicatesActive = (r: AgentPollingResponse): boolean =>
    r.isProcessing || r.status === 'pending' || r.status === 'running';

export type AgentTokenUsage = NonNullable<AgentPollingResponse['tokenUsage']>;
export type AgentInstanceSummary = NonNullable<AgentPollingResponse['instances']>[number];
export type AgentInstanceDetail = {
    agentInstanceId: string;
    status: 'pending' | 'success' | 'failed';
    brainStep: AgentPollingResponse['brainStep'];
    tickCount: number;
    goals: AgentPollingResponse['goals'];
    updates: AgentPollingResponse['updates'];
    logs: AgentPollingResponse['logs'];
    memoryCount: number;
    memories: NonNullable<AgentPollingResponse['memories']>;
    tokenUsage: AgentTokenUsage;
    budget: NonNullable<AgentPollingResponse['budget']>;
    memoryStats: NonNullable<AgentPollingResponse['memoryStats']>;
    activeSkillNames: string[];
    researchState: NonNullable<AgentPollingResponse['researchState']>;
};

export const fetchAgentInstanceList = async (
    threadId: string
): Promise<{
    instances: AgentInstanceSummary[];
    threadUsage: AgentTokenUsage;
}> => {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/agentInstanceList',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId },
    };
    const response = await axiosCustom.request(config);
    return {
        instances: Array.isArray(response.data?.instances) ? response.data.instances : [],
        threadUsage: response.data?.threadUsage || {
            prompt: 0,
            completion: 0,
            reasoning: 0,
            total: 0,
            costInUsd: 0,
            llmRequestCount: 0,
        },
    };
};

export const fetchAgentInstanceById = async (
    threadId: string,
    agentInstanceId: string
): Promise<AgentInstanceDetail> => {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/api/chat-llm/polling/agentInstanceById',
        headers: { 'Content-Type': 'application/json' },
        data: { threadId, agentInstanceId },
    };
    const response = await axiosCustom.request(config);
    return response.data;
};
