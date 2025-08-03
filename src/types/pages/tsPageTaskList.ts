export interface tsPageTask {
    // Task specific fields
    title: string;
    description: string;
    dueDate: Date;
    checklist: string[];
    comments: string[];

    // status
    priority: '' | 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    isCompleted: boolean;
    isArchived: boolean;

    // task homepage pinned
    isTaskPinned: boolean;

    // labels
    labels: string[];
    labelsAi: string[];

    // identification
    _id: string;
    taskWorkspaceId: string;
    taskStatusId: string;

    // auth
    username: string;

    // auto
    dateTimeUtc: Date;
    userAgent: string;
    createdAtUtc: Date;
    createdAtIpAddress: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;

    taskStatusList: {
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[];

    // sub task list
    subTaskArr: {
        _id: string;
        title: string;
        parentTaskId: string;
        taskCompletedStatus: boolean;
        taskPosition: number;

        // auth
        username: string;
    }[];
}

export interface tsTaskStatusArr {
    _id: string;
    boardName: string;
    boardListName: string;
    listPosition: number;
}[]