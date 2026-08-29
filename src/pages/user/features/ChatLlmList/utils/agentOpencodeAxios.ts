import axiosCustom from '../../../../../config/axiosCustom';

export type AgentOpencodePipelineStep = 'input' | 'settings' | 'opencode' | 'output' | 'done' | '';

export type AgentOpencodeInstanceStatus = 'pending' | 'filesInitialized' | 'failed';

export type AgentOpencodeInstanceSummary = {
    id: string;
    status: AgentOpencodeInstanceStatus;
    statusIsRunning: boolean;
    pipelineStep: AgentOpencodePipelineStep;
    promptText: string;
    errorReason: string;
    opencodeRunId: string;
    workspaceRootRelativePath: string;
    inputPromptRelativePath: string;
    outputPromptRelativePath: string;
    agentWorkspaceRelativePath: string;
    createdAtUtc: string;
    updatedAtUtc: string;
    filesInitializedAtUtc: string;
    isLatest: boolean;
    outputContent: string;
};

export type AgentOpencodeStatusResponse = {
    success: boolean;
    status: AgentOpencodeInstanceStatus | null;
    agentOpencodeInstanceId: string | null;
    pipelineStep?: AgentOpencodePipelineStep;
    opencodeSessionId?: string;
    instances: AgentOpencodeInstanceSummary[];
};

export const fetchAgentOpencodeStatus = async (
    threadId: string
): Promise<AgentOpencodeStatusResponse> => {
    const res = await axiosCustom.post('/api/chat-llm/agent-opencode/status', { threadId });
    return {
        success: Boolean(res.data?.success),
        status: res.data?.status ?? null,
        agentOpencodeInstanceId: res.data?.agentOpencodeInstanceId ?? null,
        pipelineStep: res.data?.pipelineStep || '',
        opencodeSessionId:
            typeof res.data?.opencodeSessionId === 'string' ? res.data.opencodeSessionId : '',
        instances: Array.isArray(res.data?.instances) ? res.data.instances : [],
    };
};

export const fetchAgentOpencodeInstanceList = async (
    threadId: string
): Promise<AgentOpencodeInstanceSummary[]> => {
    const res = await axiosCustom.post('/api/chat-llm/agent-opencode/instance-list', { threadId });
    return Array.isArray(res.data?.instances) ? res.data.instances : [];
};

export const fetchAgentOpencodeInstanceById = async (
    threadId: string,
    instanceId: string
): Promise<AgentOpencodeInstanceSummary> => {
    const res = await axiosCustom.post('/api/chat-llm/agent-opencode/instance-by-id', {
        threadId,
        instanceId,
    });
    return res.data.instance as AgentOpencodeInstanceSummary;
};

export type AgentOpencodeOpenSessionResponse = {
    success: boolean;
    message: string;
    sessionId: string;
    relativeDir: string;
    desktopUrl: string;
    desktopAuthUrl: string;
    opencodeWebUrl: string;
    webUrl: string;
};

export const openAgentOpencodeSession = async (
    threadId: string
): Promise<AgentOpencodeOpenSessionResponse> => {
    const res = await axiosCustom.post('/api/chat-llm/agent-opencode/open-session', { threadId });
    const pickUrl = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
        success: Boolean(res.data?.success),
        message: typeof res.data?.message === 'string' ? res.data.message : '',
        sessionId: typeof res.data?.sessionId === 'string' ? res.data.sessionId : '',
        relativeDir: typeof res.data?.relativeDir === 'string' ? res.data.relativeDir : '',
        desktopUrl: typeof res.data?.desktopUrl === 'string' ? res.data.desktopUrl : '',
        desktopAuthUrl: typeof res.data?.desktopAuthUrl === 'string' ? res.data.desktopAuthUrl : '',
        opencodeWebUrl: pickUrl(res.data?.opencodeWebUrl || res.data?.webUrl),
        webUrl: pickUrl(res.data?.webUrl || res.data?.opencodeWebUrl),
    };
};
