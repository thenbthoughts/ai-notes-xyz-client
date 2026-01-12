export interface tsMessageItem {
    _id: string;
    
    // identification - pagination
    dateTimeUtc: Date | null;
    paginationDateLocalYearMonthStr: string;
    paginationDateLocalYearMonthDateStr: string;

    type: string;
    content: string;
    reasoningContent: string;
    username: string;
    tags: string[];
    visibility: string;
    fileUrlArr: string[];

    // file
    fileUrl: string;
    fileContentText: string;
    fileContentAi: string;

    // model info
    isAi: boolean;
    aiModelName: string;
    aiModelProvider: string;

    // auto
    userAgent: string;
    tagsAutoAi: string[];

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;

    // Life event specific fields (added)
    title?: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    category?: string;
    subcategory?: string;
    priority?: string;
    status?: string;
    starred?: boolean;

    // stats
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    totalTokens: number;
    costInUsd: number;
}