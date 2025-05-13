export interface tsLifeEventsItem {
    // identification
    _id: string;
    username: string;

    // fields
    title: string;
    description: string;
    categoryId: string;
    categorySubId: string;
    isStarred: boolean;
    eventImpact: string;

    // identification - pagination
    eventDateUtc: string;
    eventDateYearStr: string;
    eventDateYearMonthStr: string;

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
};