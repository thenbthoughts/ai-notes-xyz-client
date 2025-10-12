export interface tsLifeEventsItem {
    // identification
    _id: string;
    username: string;

    // fields
    title: string;
    description: string;
    categoryId: string;
    categorySubId: string;
    isStar: boolean;
    eventImpact: string;

    // identification - pagination
    eventDateUtc: string;
    eventDateYearStr: string;
    eventDateYearMonthStr: string;

    // ai
    aiSummary: string;
    aiTags: string[];
    aiSuggestions: string;
    aiCategory: string;
    aiSubCategory: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;

    categoryArr: {
        name: string;
    }[];
    categorySubArr: {
        name: string;
    }[];
    comments: {
        fileUrl: string;
        fileType: string;
    }[],
};