export interface Note {
    // identification
    _id: string;

    // auth
    username: string;

    // note properties
    title: string;
    content: string;
    color: string;
    labels: string[];
    labelsAi: string[];
    isPinned: boolean;
    isSentToAI: boolean;

    // auto
    createdAtUtc: string;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: string;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}