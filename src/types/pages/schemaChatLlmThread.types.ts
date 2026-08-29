export interface IChatLlmThread {
    // identification
    _id: string;

    // fields
    threadTitle: string,

    // auto context
    isPersonalContextEnabled: boolean,
    isAutoAiContextSelectEnabled: boolean,

    // selected model
    aiModelName: string,
    aiModelProvider: string,
    aiModelOpenAiCompatibleConfigId?: string | null,

    // STT (Speech-to-Text)
    sttModelName: string;
    sttModelProvider: string;

    // TTS (Text-to-Speech)
    ttsModelName: string;
    ttsModelProvider: string;

    // model info
    aiSummary: string;
    aiTasks: object[];
    tagsAi: string[];

    agentMinBudgetTokens?: number;
    agentMaxBudgetTokens?: number;
    agentMinNumberOfIterations?: number;
    agentMaxNumberOfIterations?: number;
    agentContextActionLimit?: number;
    agentContextSummaryCount?: number;
    agentContextMessagesPerSummary?: number;
    agentScriptMaxTokens?: number;

    opencodeMcpEnabled?: boolean;
    opencodeMaxAnswerTimeMinutes?: number;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};

/** Max answer time (minutes) choices for Agent (Opencode). Hard limit is 24 hours. */
export const AGENT_OPENCODE_MAX_ANSWER_TIME_OPTIONS: Array<{ value: number; label: string }> = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 300, label: '5 hours' },
    { value: 600, label: '10 hours' },
    { value: 720, label: '12 hours' },
    { value: 1080, label: '18 hours' },
    { value: 1440, label: '1 day' },
];