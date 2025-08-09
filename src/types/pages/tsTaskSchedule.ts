// Task Schedule type for edit form and schema
export interface ITaskSchedule {
    // identification
    _id: string;
    username: string;

    // required
    isActive: boolean;
    shouldSendEmail: boolean;
    taskType: string;
    /*
    taskType:
    - taskAdd
    - notesAdd
    - customRestApiCall
    - customAiSummary
    - customTaskList
    */

    // required
    title: string;
    description: string;

    // schedule time
    timezoneName: string;
    timezoneOffset: number;
    scheduleTimeArr: string[];
    cronExpressionArr: string[];
    scheduleExecutionTimeArr: string[];

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}

export interface ITaskScheduleTaskAdd {
    taskTitle: string;
    taskDatePrefix: boolean;
    taskDeadline: string;
    taskAiSummary: boolean;
    taskAiContext: string;
}