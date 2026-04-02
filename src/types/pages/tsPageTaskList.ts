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

    // due-date reminder presets (e.g. before-1-day)
    dueDateReminderPresetLabels?: string[];
    /** Exact times and cron stored under due-date reminders (require due date on save) */
    dueDateReminderAbsoluteTimesIso?: string[];
    dueDateReminderCronExpressions?: string[];
    /** Next due-date reminder send instants (server-computed, UTC) */
    dueDateReminderScheduledTimes?: string[];
    /** Due-date reminder emails already sent (UTC) */
    dueDateReminderScheduledTimesCompleted?: string[];

    // remainder (email): exact times, cron, merged scheduled instants
    remainderAbsoluteTimesIso?: string[];
    remainderCronExpressions?: string[];
    remainderScheduledTimes?: string[];
    /** Task remainder emails already sent (UTC) */
    remainderScheduledTimesCompleted?: string[];

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

export type tsTaskStatusArr = {
    _id: string;
    boardName: string;
    boardListName: string;
    listPosition: number;
}[];
