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

    // model info
    aiSummary: string;
    aiTasks: object[];
    tagsAi: string[];

    // auth
    username: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};