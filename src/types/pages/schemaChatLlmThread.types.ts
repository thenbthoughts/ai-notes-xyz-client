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