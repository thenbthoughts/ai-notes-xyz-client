export interface tsPageTask {
    // Task specific fields
    title: string;
    description: string;
    priority: '' | 'low' | 'medium' | 'high';
    dueDate: Date;
    checklist: string[];
    comments: string[];

    // labels
    labels: string[];
    labelsAi: string[];

    // identification
    _id: string;
    boardName: string;
    taskStatus: string;

    // auth
    username: string;

    // auto
    dateTimeUtc: Date;
    userAgent: string;
    createdAtUtc: Date;
    createdAtIpAddress: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
}

export interface tsTaskStatusArr {
    _id: string;
    boardName: string;
    boardListName: string;
    listPosition: number;
}[]