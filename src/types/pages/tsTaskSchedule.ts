// Notes type for edit form and schema
export interface ITaskSchedule extends Document {
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
    scheduleTimeArr: string[];

    // cron
    cronExpressionArr: string[];

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}