// Notes type for edit form and schema
export interface INotes extends Document {
    // identification
    _id: string;
    username: string;
    notesWorkspaceId: string;

    // fields
    title: string;
    description: string;
    isStar: boolean;
    tags: string[];

    // ai
    aiSummary: string;
    aiTags: string[];
    aiSuggestions: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}