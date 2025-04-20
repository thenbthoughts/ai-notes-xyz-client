
export interface tsMessageItem {
    _id: string;
    
    // identification - pagination
    dateTimeUtc: Date | null;
    paginationDateLocalYearMonthStr: string;
    paginationDateLocalYearMonthDateStr: string;

    type: string,
    content: string;
    username: string;
    tags: string[];
    visibility: string;
    fileUrlArr: string[];

    // file
    fileUrl: string;
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
}

// TODO update required